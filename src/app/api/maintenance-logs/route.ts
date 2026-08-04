import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getMaintenanceLogModel } from "@/models/MaintenanceLog";
import { withTenant } from "@/lib/apiTenant";
import { hasPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";

const { ObjectId } = Types;

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const MaintenanceLog = getMaintenanceLogModel(tenant.connection);
  const searchParams = req.nextUrl.searchParams;
  const analyzer = searchParams.get("analyzer");
  const type = searchParams.get("type");

  const query: Record<string, any> = {};
  if (analyzer && analyzer !== "All") query.analyzer = analyzer;
  if (type && type !== "All") query.type = type;

  try {
    const logs = await MaintenanceLog.find(query).sort({ performedAt: -1 });
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user?.role, "editResults")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const MaintenanceLog = getMaintenanceLogModel(tenant.connection);
  try {
    const body = await req.json();
    const { analyzer, type, description, nextDueDate, performedAt } = body as Record<
      string,
      any
    >;

    if (
      !analyzer || typeof analyzer !== "string" ||
      !["Calibration", "Maintenance", "Repair"].includes(type) ||
      !description || typeof description !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "analyzer, a valid type, and description are required." },
        { status: 400 }
      );
    }

    const user = session.user as any;
    const newLog = await MaintenanceLog.create({
      analyzer: analyzer.trim(),
      type,
      description: description.trim(),
      nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
      performedAt: performedAt ? new Date(performedAt) : new Date(),
      performedBy: user?._id,
      performedByLabel: `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim() || "Unknown",
    });

    await logActivity(
      tenant.connection,
      session,
      "maintenance.logged",
      `Logged ${type} on ${analyzer.trim()}`
    );

    return NextResponse.json({ success: true, data: newLog }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});

export const DELETE = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user?.role, "deleteRecords")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const MaintenanceLog = getMaintenanceLogModel(tenant.connection);
  try {
    const body = await req.json();
    const id = body.id;
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    await MaintenanceLog.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
