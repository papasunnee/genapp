import { NextResponse } from "next/server";
import { withTenant } from "@/lib/apiTenant";
import { isPayablePlan, PLAN_PRICES } from "@/lib/pricing";

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const org = tenant.organization;
  return NextResponse.json({
    success: true,
    data: {
      plan: org.plan,
      subscriptionStatus: org.subscriptionStatus,
      subscriptionRenewsAt: org.subscriptionRenewsAt || null,
      isPayablePlan: isPayablePlan(org.plan),
      // Free orgs need every payable plan's pricing to choose an upgrade
      // target; an already-paying org only needs its own plan's pricing.
      prices: isPayablePlan(org.plan) ? { [org.plan]: PLAN_PRICES[org.plan] } : PLAN_PRICES,
    },
  });
});
