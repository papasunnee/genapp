import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getReferrerModel } from "@/models/Referrer";
import { getPatientModel } from "@/models/Patient";
import { withTenant } from "@/lib/apiTenant";
import { hasPermission } from "@/lib/permissions";

const { ObjectId } = Types;
const EDITABLE_FIELDS = ["name", "type", "phone", "email", "address", "notes", "status"] as const;

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Referrer = getReferrerModel(tenant.connection);
  const Patient = getPatientModel(tenant.connection);

  try {
    const [referrers, counts] = await Promise.all([
      Referrer.find().sort({ name: 1 }),
      Patient.aggregate([
        { $match: { referrer: { $ne: null } } },
        { $group: { _id: "$referrer", count: { $sum: 1 } } },
      ]),
    ]);

    const countByReferrer = new Map(counts.map((c) => [c._id.toString(), c.count]));
    const data = referrers.map((r) => ({
      ...r.toObject(),
      referredPatientCount: countByReferrer.get(r._id.toString()) ?? 0,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Referrer = getReferrerModel(tenant.connection);
  try {
    const body = await req.json();
    const fields: Record<string, any> = {};
    for (const field of EDITABLE_FIELDS) {
      if (body[field] !== undefined) fields[field] = body[field];
    }
    if (!fields.name || typeof fields.name !== "string" || !fields.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Referrer name is required." },
        { status: 400 }
      );
    }

    const newReferrer = await Referrer.create(fields);
    return NextResponse.json({ success: true, data: newReferrer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});

export const PUT = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Referrer = getReferrerModel(tenant.connection);
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

    const updated = await Referrer.findOneAndUpdate({ _id: put_id }, update, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Referrer not found" }, { status: 404 });
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
  if (!hasPermission(session.user?.role, "deleteRecords")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const Referrer = getReferrerModel(tenant.connection);
  try {
    const body = await req.json();
    const delete_id = body.delete_id;
    if (typeof delete_id !== "string" || !ObjectId.isValid(delete_id)) {
      return NextResponse.json({ success: false, error: "Invalid delete_id" }, { status: 400 });
    }

    await Referrer.deleteOne({ _id: delete_id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
