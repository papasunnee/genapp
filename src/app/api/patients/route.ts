import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getPatientModel } from "@/models/Patient";
import { getTestModel } from "@/models/Test";
import { getPaymentModel } from "@/models/Payment";
import { getInvoiceModel } from "@/models/Invoice";
import { withTenant } from "@/lib/apiTenant";
import { hasPermission } from "@/lib/permissions";
import { getPlanLimits } from "@/lib/planLimits";
import { logActivity } from "@/lib/activityLog";

const { ObjectId } = Types;

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Patient = getPatientModel(tenant.connection);
  getTestModel(tenant.connection);
  getPaymentModel(tenant.connection);
  getInvoiceModel(tenant.connection);
  const id = req.nextUrl.searchParams.get("id");

  try {
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: "Invalid patient id" },
          { status: 400 }
        );
      }
      const singlePatient = await Patient.findOne({
        _id: new ObjectId(id),
      }).populate([
        {
          path: "tests",
          options: { sort: { createdAt: -1 } },
          populate: [
            {
              path: "payment",
              populate: {
                path: "user",
              },
            },
            { path: "invoice" },
          ],
        },
      ]);
      return NextResponse.json({ success: true, data: singlePatient });
    }

    const allRecords = await Patient.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: allRecords });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
});

const EDITABLE_PATIENT_FIELDS = [
  "firstname",
  "lastname",
  "dob",
  "gender",
  "address",
  "city",
  "country",
  "phone",
  "description",
  "email",
] as const;

export const POST = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Patient = getPatientModel(tenant.connection);

  try {
    const limits = getPlanLimits(tenant.organization);
    const patientCount = await Patient.countDocuments();
    if (patientCount >= limits.maxPatients) {
      return NextResponse.json(
        {
          success: false,
          error: `Your ${tenant.organization.plan} plan is limited to ${limits.maxPatients} patient records. Upgrade to add more.`,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const patientFields: Record<string, any> = {};
    for (const field of EDITABLE_PATIENT_FIELDS) {
      if (body[field] !== undefined) patientFields[field] = body[field];
    }
    const newRecord = await Patient.create(patientFields);
    await logActivity(
      tenant.connection,
      session,
      "patient.created",
      `Registered patient ${newRecord.firstname} ${newRecord.lastname}`
    );
    return NextResponse.json({ success: true, data: newRecord }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});

export const PUT = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Patient = getPatientModel(tenant.connection);

  try {
    const body = await req.json();
    const put_id = body.put_id;
    if (typeof put_id !== "string" || !ObjectId.isValid(put_id)) {
      return NextResponse.json(
        { success: false, error: "unprocessed put_id" },
        { status: 400 }
      );
    }

    // Previously wrote { title, paragraphs } - fields that don't exist
    // anywhere on the Patient schema, so this endpoint silently did
    // nothing useful. Fixed to target the schema's real editable fields,
    // the same allow-list POST uses.
    const update: Record<string, any> = {};
    for (const field of EDITABLE_PATIENT_FIELDS) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    const updatePatient = await Patient.findOneAndUpdate(
      { _id: put_id },
      update,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: updatePatient });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

export const DELETE = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  // Deleting a patient record (and, per the medical-records nature of this
  // app, everything referencing it) is destructive - Super Admin/Admin only.
  if (!hasPermission(session.user?.role, "deleteRecords")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const Patient = getPatientModel(tenant.connection);

  try {
    const body = await req.json();
    const delete_id = body.delete_id;
    if (typeof delete_id !== "string" || !ObjectId.isValid(delete_id)) {
      return NextResponse.json(
        { success: false, error: "Unprocessed delete_id" },
        { status: 400 }
      );
    }

    const deletePatientResponse = await Patient.deleteOne({ _id: delete_id });
    return NextResponse.json({ success: true, data: deletePatientResponse });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
