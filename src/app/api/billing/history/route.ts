import { NextResponse } from "next/server";
import { withTenant } from "@/lib/apiTenant";
import { getSubscriptionEventModel } from "@/models/SubscriptionEvent";
import { getControlConnection } from "@/lib/controlPlane";

/**
 * The org's own view of its subscription history - the tenant-scoped
 * equivalent of the platform admin's subscription-history endpoint.
 * SubscriptionEvent lives on the control-plane connection (shared across
 * all orgs), so this reaches for that directly rather than the tenant
 * connection withTenant already resolved.
 */
export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const requesterWeight = (session.user as any)?.role?.weight;
  if (![100, 200].includes(requesterWeight)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const controlConn = await getControlConnection();
  const SubscriptionEvent = getSubscriptionEventModel(controlConn);
  const events = await SubscriptionEvent.find({ organization: tenant.organization._id }).sort({
    createdAt: -1,
  });

  return NextResponse.json({ success: true, data: events });
});
