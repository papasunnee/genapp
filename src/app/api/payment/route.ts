import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getPaymentModel } from "@/models/Payment";
import { getTestModel } from "@/models/Test";
import { getUserModel } from "@/models/User";
import { getRoleModel } from "@/models/Role";
import { withTenant } from "@/lib/apiTenant";

const { ObjectId } = Types;

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Payment = getPaymentModel(tenant.connection);
  getTestModel(tenant.connection);
  getUserModel(tenant.connection);
  getRoleModel(tenant.connection);
  const id = req.nextUrl.searchParams.get("id");
  const test_id = req.nextUrl.searchParams.get("test_id");

  try {
    if (id) {
      const singlePayment = await Payment.findOne({
        _id: new ObjectId(id),
      }).populate(["user", "test"]);
      return NextResponse.json({ success: true, data: singlePayment });
    } else if (test_id) {
      const singlePaymentByTestId = await Payment.findOne({
        test_id: new ObjectId(test_id),
      }).populate(["user", "test"]);
      return NextResponse.json({ success: true, data: singlePaymentByTestId });
    }

    const allRecords = await Payment.find()
      .populate([
        { path: "test" },
        {
          path: "user",
          populate: {
            path: "role",
          },
        },
      ])
      .sort({ createdAt: -1 });
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

  const Payment = getPaymentModel(tenant.connection);
  const Test = getTestModel(tenant.connection);
  getUserModel(tenant.connection);

  try {
    const body = await req.json();
    const newRecord = await Payment.create({
      ...body,
      user: session.user?._id,
    });
    const updatedTest = await Test.findOneAndUpdate(
      { _id: new ObjectId(newRecord.test) },
      {
        status: "Awaiting Result",
        payment: new ObjectId(newRecord._id),
      },
      { new: true }
    ).populate([
      {
        path: "payment",
        populate: {
          path: "user",
        },
      },
    ]);

    return NextResponse.json({ success: true, data: updatedTest }, { status: 201 });
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

  const Payment = getPaymentModel(tenant.connection);

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
    const updatePayment = await Payment.findOneAndUpdate(
      { _id: put_id },
      { title: body.title, paragraphs: body.paragraphs },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatePayment });
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

  const Payment = getPaymentModel(tenant.connection);

  try {
    const body = await req.json();
    const delete_id = body.delete_id;
    if (!delete_id) {
      return NextResponse.json(
        { success: false, error: "Unprocessed delete_id" },
        { status: 400 }
      );
    }

    const deletePaymentResponse = await Payment.deleteOne({ _id: delete_id });
    return NextResponse.json({ success: true, data: deletePaymentResponse });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
