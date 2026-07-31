import { NextResponse } from "next/server";
import { getActivityLogModel } from "@/models/ActivityLog";
import { withTenant } from "@/lib/apiTenant";

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as any)?.role?.weight !== 100) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const ActivityLog = getActivityLogModel(tenant.connection);
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(500);
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
