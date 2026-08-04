import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getQCLogModel } from "@/models/QCLog";
import { withTenant } from "@/lib/apiTenant";
import { hasPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";

const { ObjectId } = Types;

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const QCLog = getQCLogModel(tenant.connection);
  const searchParams = req.nextUrl.searchParams;
  const analyzer = searchParams.get("analyzer");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const query: Record<string, any> = {};
  if (analyzer && analyzer !== "All") query.analyzer = analyzer;
  if (status && status !== "All") query.status = status;
  if (from || to) {
    query.performedAt = {};
    if (from) query.performedAt.$gte = new Date(from);
    if (to) query.performedAt.$lte = new Date(to);
  }

  try {
    const logs = await QCLog.find(query).sort({ performedAt: -1 });
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

  const QCLog = getQCLogModel(tenant.connection);

  try {
    const body = await req.json();
    const {
      analyzer,
      testName,
      controlLevel,
      expectedRange,
      observedValue,
      status,
      correctiveAction,
      notes,
      performedAt,
    } = body as Record<string, any>;

    if (
      !analyzer || typeof analyzer !== "string" ||
      !testName || typeof testName !== "string" ||
      !controlLevel || typeof controlLevel !== "string" ||
      !observedValue || typeof observedValue !== "string" ||
      (status !== "Pass" && status !== "Fail")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "analyzer, testName, controlLevel, observedValue, and a valid status are required.",
        },
        { status: 400 }
      );
    }

    const user = session.user as any;
    const newLog = await QCLog.create({
      analyzer: analyzer.trim(),
      testName: testName.trim(),
      controlLevel: controlLevel.trim(),
      expectedRange: typeof expectedRange === "string" ? expectedRange.trim() : undefined,
      observedValue: observedValue.trim(),
      status,
      correctiveAction: typeof correctiveAction === "string" ? correctiveAction.trim() : undefined,
      notes: typeof notes === "string" ? notes.trim() : undefined,
      performedBy: user?._id,
      performedByLabel: `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim() || "Unknown",
      performedAt: performedAt ? new Date(performedAt) : new Date(),
    });

    await logActivity(
      tenant.connection,
      session,
      "qc.logged",
      `Logged ${status} QC entry for ${testName.trim()} on ${analyzer.trim()}`
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

  const QCLog = getQCLogModel(tenant.connection);

  try {
    const body = await req.json();
    const id = body.id;
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    const log = await QCLog.findById(id);
    if (!log) {
      return NextResponse.json({ success: false, error: "QC log entry not found" }, { status: 404 });
    }

    await QCLog.deleteOne({ _id: id });
    await logActivity(
      tenant.connection,
      session,
      "qc.deleted",
      `Deleted QC entry for ${log.testName} on ${log.analyzer}`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
