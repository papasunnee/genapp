import crypto from "crypto";
import { NextResponse } from "next/server";
import { withTenant } from "@/lib/apiTenant";
import { isPayablePlan, getPlanAmount, PayablePlan } from "@/lib/pricing";
import { initializeTransaction } from "@/lib/paystack";

/**
 * Starts a billing payment for the org: a renewal of its current plan if
 * it's already on Starter/Pro, or an upgrade off the Free trial if a
 * target plan is given (Free has nothing of its own to renew). Self-serve,
 * usable both before expiry (extends the existing renewal date) and after
 * (reactivates the subscription). Only Super Admin/Admin can trigger a
 * charge on the organization's behalf.
 */
export const POST = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const requesterWeight = (session.user as any)?.role?.weight;
  if (![100, 200].includes(requesterWeight)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const organization = tenant.organization;

  try {
    const body = await req.json();
    const billing = body.billing;
    if (billing !== "monthly" && billing !== "yearly") {
      return NextResponse.json(
        { success: false, error: "Invalid billing cycle" },
        { status: 400 }
      );
    }

    let targetPlan: PayablePlan;
    if (isPayablePlan(organization.plan)) {
      targetPlan = organization.plan;
    } else if (isPayablePlan(body.plan)) {
      targetPlan = body.plan;
    } else {
      return NextResponse.json(
        { success: false, error: "Choose a plan to upgrade to (Starter or Pro)" },
        { status: 400 }
      );
    }

    const reference = `renewal_${crypto.randomUUID()}`;
    const amountKobo = getPlanAmount(targetPlan, billing) * 100;

    const { authorizationUrl } = await initializeTransaction({
      email: (session.user as any)?.email,
      amountKobo,
      reference,
      callbackUrl: `${req.nextUrl.origin}/payment/callback`,
      metadata: {
        kind: "renewal",
        organizationId: organization._id.toString(),
        billing,
        targetPlan,
      },
    });

    return NextResponse.json({ success: true, data: { authorizationUrl } });
  } catch (error: any) {
    console.error("Billing renewal initialize failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
});
