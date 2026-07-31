import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getPatientModel } from "@/models/Patient";
import { getTestModel } from "@/models/Test";
import { getPaymentModel } from "@/models/Payment";
import { withTenant } from "@/lib/apiTenant";
import { getPlanLimits } from "@/lib/planLimits";

const { ObjectId } = Types;

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Patient = getPatientModel(tenant.connection);
  getTestModel(tenant.connection);
  getPaymentModel(tenant.connection);
  const id = req.nextUrl.searchParams.get("id");

  try {
    if (id) {
      const singlePatient = await Patient.findOne({
        _id: new ObjectId(id),
      }).populate([
        {
          path: "tests",
          options: { sort: { createdAt: -1 } },
          populate: {
            path: "payment",
            populate: {
              path: "user",
            },
          },
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
    const newRecord = await Patient.create({ ...body });
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
    if (!put_id) {
      return NextResponse.json(
        { success: false, error: "unprocessed put_id" },
        { status: 400 }
      );
    }

    delete body._id;
    const updatePatient = await Patient.findOneAndUpdate(
      { _id: put_id },
      { title: body.title, paragraphs: body.paragraphs },
      { new: true }
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

  const Patient = getPatientModel(tenant.connection);

  try {
    const body = await req.json();
    const delete_id = body.delete_id;
    if (!delete_id) {
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
