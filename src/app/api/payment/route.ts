import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getPaymentModel } from "@/models/Payment";
import { getTestModel } from "@/models/Test";
import { getUserModel } from "@/models/User";
import { getRoleModel } from "@/models/Role";
import { getInvoiceModel } from "@/models/Invoice";
import { withTenant } from "@/lib/apiTenant";
import { logActivity } from "@/lib/activityLog";
import { formatCurrency } from "@/utils/functions";

const { ObjectId } = Types;

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Payment = getPaymentModel(tenant.connection);
  getTestModel(tenant.connection);
  getUserModel(tenant.connection);
  getRoleModel(tenant.connection);
  getInvoiceModel(tenant.connection);
  const id = req.nextUrl.searchParams.get("id");
  const test_id = req.nextUrl.searchParams.get("test_id");

  try {
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: "Invalid payment id" },
          { status: 400 }
        );
      }
      const singlePayment = await Payment.findOne({
        _id: new ObjectId(id),
      }).populate(["user", "test", "invoice"]);
      return NextResponse.json({ success: true, data: singlePayment });
    } else if (test_id) {
      if (!ObjectId.isValid(test_id)) {
        return NextResponse.json(
          { success: false, error: "Invalid test id" },
          { status: 400 }
        );
      }
      const singlePaymentByTestId = await Payment.findOne({
        test: new ObjectId(test_id),
      }).populate(["user", "test", "invoice"]);
      return NextResponse.json({ success: true, data: singlePaymentByTestId });
    }

    const allRecords = await Payment.find()
      .populate([
        { path: "test" },
        { path: "invoice" },
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

/**
 * Records a payment against a test's invoice - the invoice already exists
 * (created automatically when the test was ordered, see POST
 * /api/diagnosis), so there is nothing for staff to type in here beyond
 * the amount and method. The amount is validated against the invoice's
 * own total server-side now, not just checked client-side (the previous
 * version trusted whatever amount_paid was posted with no cross-check at
 * all against the test's actual cost).
 */
export const POST = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Payment = getPaymentModel(tenant.connection);
  const Test = getTestModel(tenant.connection);
  const Invoice = getInvoiceModel(tenant.connection);
  getUserModel(tenant.connection);

  try {
    const body = await req.json();
    const { test: testId, amount_paid, payment_option } = body;

    if (typeof testId !== "string" || !ObjectId.isValid(testId)) {
      return NextResponse.json(
        { success: false, error: "A valid test must be specified" },
        { status: 400 }
      );
    }
    if (payment_option !== "cash" && payment_option !== "card") {
      return NextResponse.json(
        { success: false, error: "Invalid payment method" },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findOne({ test: testId });
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "No invoice found for this test." },
        { status: 404 }
      );
    }
    if (invoice.status === "Paid") {
      return NextResponse.json(
        { success: false, error: "This invoice has already been paid in full." },
        { status: 400 }
      );
    }
    if (invoice.status === "Void") {
      return NextResponse.json(
        { success: false, error: "This invoice has been voided and can no longer be paid." },
        { status: 400 }
      );
    }

    const amountPaidNumber = Number(amount_paid);
    if (!amountPaidNumber || amountPaidNumber <= 0) {
      return NextResponse.json(
        { success: false, error: "Enter a valid amount." },
        { status: 400 }
      );
    }
    if (amountPaidNumber !== invoice.amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Amount must match the invoice total of ${formatCurrency(invoice.amount)}.`,
        },
        { status: 400 }
      );
    }

    const newPayment = await Payment.create({
      invoice: invoice._id,
      amount_paid: amountPaidNumber,
      payment_option,
      test: testId,
      user: session.user?._id,
    });

    invoice.amountPaid = amountPaidNumber;
    invoice.status = "Paid";
    await invoice.save();

    const updatedTest = await Test.findOneAndUpdate(
      { _id: new ObjectId(testId) },
      {
        status: "Awaiting Result",
        payment: newPayment._id,
      },
      { new: true }
    ).populate([
      {
        path: "payment",
        populate: {
          path: "user",
        },
      },
      { path: "invoice" },
    ]);

    await logActivity(
      tenant.connection,
      session,
      "invoice.paid",
      `Invoice ${invoice.invoiceNumber} paid in full (${formatCurrency(amountPaidNumber)}) for "${
        updatedTest?.test_title
      }"`
    );

    return NextResponse.json({ success: true, data: updatedTest }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});
