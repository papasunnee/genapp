import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getBranchModel } from "@/models/Branch";
import { getPatientModel } from "@/models/Patient";
import { withTenant } from "@/lib/apiTenant";
import { getPlanLimits } from "@/lib/planLimits";

const { ObjectId } = Types;
const EDITABLE_FIELDS = ["name", "address", "phone", "status"] as const;

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Branch = getBranchModel(tenant.connection);
  try {
    const branches = await Branch.find().sort({ createdAt: 1 });
    return NextResponse.json({
      success: true,
      data: branches,
      multiBranch: getPlanLimits(tenant.organization).multiBranch,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const weight = (session.user as any)?.role?.weight;
  if (![100, 200].includes(weight)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!getPlanLimits(tenant.organization).multiBranch) {
    return NextResponse.json(
      { success: false, error: "Multi-branch support requires an Enterprise plan." },
      { status: 403 }
    );
  }

  const Branch = getBranchModel(tenant.connection);
  try {
    const body = await req.json();
    const fields: Record<string, any> = {};
    for (const field of EDITABLE_FIELDS) {
      if (body[field] !== undefined) fields[field] = body[field];
    }
    if (!fields.name || typeof fields.name !== "string" || !fields.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Branch name is required." },
        { status: 400 }
      );
    }

    const newBranch = await Branch.create(fields);
    return NextResponse.json({ success: true, data: newBranch }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});

export const PUT = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const weight = (session.user as any)?.role?.weight;
  if (![100, 200].includes(weight)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const Branch = getBranchModel(tenant.connection);
  try {
    const body = await req.json();
    const put_id = body.put_id;
    if (typeof put_id !== "string" || !ObjectId.isValid(put_id)) {
      return NextResponse.json({ success: false, error: "Invalid put_id" }, { status: 400 });
    }

    const update: Record<string, any> = {};
    for (const field of EDITABLE_FIELDS) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    const updated = await Branch.findOneAndUpdate({ _id: put_id }, update, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Branch not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const DELETE = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const weight = (session.user as any)?.role?.weight;
  if (![100, 200].includes(weight)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const Branch = getBranchModel(tenant.connection);
  const Patient = getPatientModel(tenant.connection);
  try {
    const body = await req.json();
    const delete_id = body.delete_id;
    if (typeof delete_id !== "string" || !ObjectId.isValid(delete_id)) {
      return NextResponse.json({ success: false, error: "Invalid delete_id" }, { status: 400 });
    }

    const inUse = await Patient.countDocuments({ branch: delete_id });
    if (inUse > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `${inUse} patient record(s) are assigned to this branch. Reassign them before deleting it.`,
        },
        { status: 409 }
      );
    }

    await Branch.deleteOne({ _id: delete_id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
