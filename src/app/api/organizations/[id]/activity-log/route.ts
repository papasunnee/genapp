import { NextRequest, NextResponse } from "next/server";
import { getOrganizationModel } from "@/models/Organization";
import { getActivityLogModel } from "@/models/ActivityLog";
import { getControlConnection } from "@/lib/controlPlane";
import { getTenantConnection } from "@/lib/tenantConnection";
import { isAuthorizedPlatformRequest } from "@/lib/platformAuth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorizedPlatformRequest(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const controlConn = await getControlConnection();
    const Organization = getOrganizationModel(controlConn);
    const organization = await Organization.findById(id);

    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    const tenantConn = await getTenantConnection(organization.dbName);
    const ActivityLog = getActivityLogModel(tenantConn);
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    console.error("Failed to load activity log:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
