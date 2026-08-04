import { getOrganizationModel } from "@/models/Organization";
import { getSubscriptionEventModel } from "@/models/SubscriptionEvent";
import { getControlConnection } from "@/lib/controlPlane";
import { getPlanAmount, isPayablePlan } from "@/lib/pricing";
import { verifyTransaction } from "@/lib/paystack";
import { addBillingPeriod } from "@/lib/provisionOrganization";

export type RenewalResult =
  | { status: "not-paid" }
  | { status: "invalid" }
  | { status: "success"; subdomain: string; renewsAt: Date };

/**
 * Turns a successfully-paid renewal reference into an extended
 * subscription. Unlike a new signup, the organization already exists -
 * this only ever updates subscriptionStatus/subscriptionRenewsAt and logs
 * a SubscriptionEvent. Idempotent the same way signup provisioning is: the
 * webhook and the callback page both call this for the same reference,
 * and whichever arrives second sees its own already-recorded
 * SubscriptionEvent and does nothing further.
 */
export async function provisionRenewalFromReference(
  reference: string
): Promise<RenewalResult> {
  const verified = await verifyTransaction(reference);
  if (verified.status !== "success") {
    return { status: "not-paid" };
  }

  const metadata = verified.metadata || {};
  const organizationId = metadata.organizationId;
  const billing = metadata.billing;
  const targetPlan = metadata.targetPlan;
  if (!organizationId || (billing !== "monthly" && billing !== "yearly")) {
    return { status: "invalid" };
  }

  const controlConn = await getControlConnection();
  const Organization = getOrganizationModel(controlConn);
  const SubscriptionEvent = getSubscriptionEventModel(controlConn);

  // Idempotency check by reference substring rather than an exact note
  // match, since the note text itself differs between a plain renewal and
  // an upgrade-from-Free (computed below) - whichever caller (webhook vs.
  // callback) arrives second must still recognize its own prior work.
  const alreadyProcessed = await SubscriptionEvent.findOne({
    organization: organizationId,
    note: { $regex: reference },
  });
  if (alreadyProcessed) {
    const organization = await Organization.findById(organizationId);
    return organization
      ? { status: "success", subdomain: organization.subdomain, renewsAt: organization.subscriptionRenewsAt! }
      : { status: "invalid" };
  }

  const organization = await Organization.findById(organizationId);
  if (!organization) {
    return { status: "invalid" };
  }

  // A Free-trial org has no plan of its own to "renew" - it must be
  // upgrading to a paid plan chosen at checkout time. An already-paying
  // org just renews whatever plan it's already on.
  const isUpgradeFromFree = organization.plan === "Free";
  const effectivePlan = isUpgradeFromFree ? targetPlan : organization.plan;
  if (!isPayablePlan(effectivePlan)) {
    return { status: "invalid" };
  }

  // Renewing before expiry extends from the current renewal date rather
  // than from today, so paying early never shortens what was already
  // paid for. Renewing after expiry (or with no prior date, e.g. a first
  // upgrade from Free) starts fresh from now.
  const extendFrom =
    organization.subscriptionRenewsAt && organization.subscriptionRenewsAt > new Date()
      ? organization.subscriptionRenewsAt
      : new Date();
  const renewsAt = addBillingPeriod(extendFrom, billing);

  organization.plan = effectivePlan;
  organization.subscriptionStatus = "Active";
  organization.subscriptionRenewsAt = renewsAt;
  await organization.save();

  await SubscriptionEvent.create({
    organization: organization._id,
    plan: organization.plan,
    subscriptionStatus: "Active",
    amount: getPlanAmount(effectivePlan, billing),
    renewsAt,
    note: isUpgradeFromFree
      ? `Upgraded from Free to ${effectivePlan} via Paystack (ref: ${reference})`
      : `Self-serve renewal via Paystack (ref: ${reference})`,
  });

  return { status: "success", subdomain: organization.subdomain, renewsAt };
}
