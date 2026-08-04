import { NextResponse } from "next/server";
import { getActivityLogModel } from "@/models/ActivityLog";
import { withTenant } from "@/lib/apiTenant";
import { hasPermission } from "@/lib/permissions";

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user?.role, "viewAuditLog")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const ActivityLog = getActivityLogModel(tenant.connection);
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(500);
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    console.error("Failed to load activity log:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
});
