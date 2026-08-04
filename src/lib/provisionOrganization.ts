import { getOrganizationModel, OrganizationPlan } from "@/models/Organization";
import { getSubscriptionEventModel } from "@/models/SubscriptionEvent";
import { getPendingSignupModel } from "@/models/PendingSignup";
import { getRoleModel } from "@/models/Role";
import { getUserModel } from "@/models/User";
import { getAccessModel } from "@/models/Access";
import { getControlConnection } from "@/lib/controlPlane";
import { getTenantConnection } from "@/lib/tenantConnection";
import { seedTestCatalog } from "@/lib/seedTestCatalog";
import { getPlanAmount } from "@/lib/pricing";
import { verifyTransaction } from "@/lib/paystack";

const DEFAULT_ROLES = [
  { name: "Super Admin", weight: 100 },
  { name: "Admin", weight: 200 },
  { name: "Lab Technician", weight: 300 },
  { name: "Accountant", weight: 400 },
  { name: "Front Desk", weight: 500 },
];

export function addBillingPeriod(from: Date, billing: "monthly" | "yearly"): Date {
  const result = new Date(from);
  if (billing === "yearly") {
    result.setFullYear(result.getFullYear() + 1);
  } else {
    result.setMonth(result.getMonth() + 1);
  }
  return result;
}

interface AdminDetails {
  adminFirstname: string;
  adminLastname: string;
  adminEmail: string;
  adminPassword: string;
}

async function seedTenant(dbName: string, admin: AdminDetails) {
  const tenantConn = await getTenantConnection(dbName);
  const Role = getRoleModel(tenantConn);
  const User = getUserModel(tenantConn);
  const Access = getAccessModel(tenantConn);

  const roles = await Role.insertMany(DEFAULT_ROLES);
  const superAdminRole = roles.find((r) => r.weight === 100)!;

  const adminUser = await User.create({
    firstname: admin.adminFirstname,
    lastname: admin.adminLastname,
    email: admin.adminEmail,
    dob: new Date("1990-01-01"),
    phone: "0000000000",
    role: superAdminRole._id,
    status: "Active",
  });
  await Access.create({ password: admin.adminPassword, user: adminUser._id });
  await seedTestCatalog(tenantConn);
}

interface CreateOrganizationParams extends AdminDetails {
  organizationName: string;
  subdomain: string;
  plan: OrganizationPlan;
  subscriptionStatus: "Trial" | "Active";
  subscriptionRenewsAt: Date | null;
  eventAmount: number;
  eventNote: string;
}

/**
 * Shared core behind every way an organization comes into existence
 * outside the platform admin's own creation form: self-serve Free signup
 * (immediate, no payment) and self-serve paid signup (after payment
 * confirms). Claims the subdomain via the unique index first, then seeds
 * the tenant database, rolling the org back if seeding fails so a broken
 * signup never leaves a discoverable-but-unusable subdomain squatting on
 * the index.
 */
export async function createOrganizationAndSeed(
  params: CreateOrganizationParams
): Promise<{ organizationId: string; subdomain: string; organizationName: string }> {
  const controlConn = await getControlConnection();
  const Organization = getOrganizationModel(controlConn);
  const dbName = `labsuite_tenant_${params.subdomain}`;

  const organization = await Organization.create({
    name: params.organizationName,
    subdomain: params.subdomain,
    dbName,
    status: "Active",
    plan: params.plan,
    subscriptionStatus: params.subscriptionStatus,
    subscriptionRenewsAt: params.subscriptionRenewsAt,
  });

  try {
    await seedTenant(dbName, params);
  } catch (seedError) {
    await Organization.deleteOne({ _id: organization._id });
    throw seedError;
  }

  const SubscriptionEvent = getSubscriptionEventModel(controlConn);
  await SubscriptionEvent.create({
    organization: organization._id,
    plan: organization.plan,
    subscriptionStatus: organization.subscriptionStatus,
    amount: params.eventAmount,
    renewsAt: params.subscriptionRenewsAt,
    note: params.eventNote,
  });

  return {
    organizationId: organization._id.toString(),
    subdomain: organization.subdomain,
    organizationName: organization.name,
  };
}

export type ProvisionResult =
  | { status: "not-paid" }
  | { status: "unknown-reference" }
  | { status: "subdomain-conflict" }
  | { status: "success"; subdomain: string; organizationName: string };

/**
 * Turns a successfully-paid Paystack reference into a real, usable
 * organization: verifies the payment server-to-server (never trusts the
 * caller's own claim of success), then creates the Organization + seeds its
 * tenant database. Safe to call more than once for the same reference -
 * both the webhook and the callback page call this, racing to see which
 * arrives first, and the Organization's unique subdomain index is the
 * actual arbiter of who "wins": the loser catches the duplicate-key error
 * and just returns the winner's result instead of erroring.
 */
export async function provisionOrganizationFromReference(
  reference: string
): Promise<ProvisionResult> {
  const verified = await verifyTransaction(reference);
  if (verified.status !== "success") {
    return { status: "not-paid" };
  }

  const controlConn = await getControlConnection();
  const PendingSignup = getPendingSignupModel(controlConn);
  const Organization = getOrganizationModel(controlConn);

  const pending = await PendingSignup.findOne({ reference });
  if (!pending) {
    // No pending record left: either the reference is bogus, or this
    // payment was already provisioned by the other caller (webhook vs.
    // callback page) and its pending record already consumed/deleted.
    // Since the subdomain isn't recoverable from here, treat this as
    // "nothing further for this caller to do", not an error.
    return { status: "unknown-reference" };
  }

  const amount = getPlanAmount(pending.plan, pending.billing);
  const renewsAt = addBillingPeriod(new Date(), pending.billing);
  const eventNote = `Self-serve signup via Paystack (ref: ${reference})`;

  let result;
  try {
    // Claims the subdomain atomically via the unique index first, before
    // any tenant seeding - a concurrent duplicate call fails right here
    // with a duplicate-key error, never touching the tenant database twice.
    result = await createOrganizationAndSeed({
      organizationName: pending.organizationName,
      subdomain: pending.subdomain,
      adminFirstname: pending.adminFirstname,
      adminLastname: pending.adminLastname,
      adminEmail: pending.adminEmail,
      adminPassword: pending.adminPassword,
      plan: pending.plan,
      subscriptionStatus: "Active",
      subscriptionRenewsAt: renewsAt,
      eventAmount: amount,
      eventNote,
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      // Someone already holds this subdomain. This is only a legitimate
      // "already provisioned" case if it's the SAME payment reaching here
      // twice (webhook vs. callback racing each other) - check the audit
      // trail before assuming that, so a genuinely different signup that
      // lost the subdomain race never gets told it succeeded and pointed
      // at a stranger's organization.
      const existing = await Organization.findOne({ subdomain: pending.subdomain });
      const matchingEvent = existing
        ? await getSubscriptionEventModel(controlConn).findOne({
            organization: existing._id,
            note: eventNote,
          })
        : null;

      if (existing && matchingEvent) {
        await PendingSignup.deleteOne({ _id: pending._id }).catch(() => {});
        return {
          status: "success",
          subdomain: existing.subdomain,
          organizationName: existing.name,
        };
      }

      return { status: "subdomain-conflict" };
    }
    throw error;
  }

  await PendingSignup.deleteOne({ _id: pending._id });

  return {
    status: "success",
    subdomain: result.subdomain,
    organizationName: result.organizationName,
  };
}
