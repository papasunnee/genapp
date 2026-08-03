import { NextResponse } from "next/server";
import { Types } from "mongoose";
import moment from "moment";
import { getTestModel } from "@/models/Test";
import { getPatientModel } from "@/models/Patient";
import { getUserModel } from "@/models/User";
import { getPaymentModel } from "@/models/Payment";
import { getRoleModel } from "@/models/Role";
import { getInvoiceModel } from "@/models/Invoice";
import { withTenant } from "@/lib/apiTenant";
import { logActivity } from "@/lib/activityLog";
import { nextInvoiceNumber } from "@/lib/invoiceNumber";
import { formatCurrency } from "@/utils/functions";

const { ObjectId } = Types;

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Test = getTestModel(tenant.connection);
  getPatientModel(tenant.connection);
  getUserModel(tenant.connection);
  getPaymentModel(tenant.connection);
  getRoleModel(tenant.connection);
  getInvoiceModel(tenant.connection);
  const id = req.nextUrl.searchParams.get("id");
  const filterFlag = req.nextUrl.searchParams.get("filter");

  try {
    if (id) {
      const singleTest = await Test.findOne({
        _id: new ObjectId(id),
      }).populate([
        { path: "patient" },
        { path: "user" },
        {
          path: "payment",
          populate: {
            path: "user",
            populate: {
              path: "role",
            },
          },
        },
        { path: "invoice" },
      ]);
      return NextResponse.json({ success: true, data: singleTest });
    }

    if (filterFlag) {
      const queryFilter: Record<string, any> = Object.fromEntries(
        req.nextUrl.searchParams.entries()
      );
      delete queryFilter.filter;

      const filteredData = await Test.find(queryFilter)
        .populate([
          { path: "patient" },
          { path: "user" },
          {
            path: "payment",
            populate: {
              path: "user",
              populate: {
                path: "role",
              },
            },
          },
          { path: "invoice" },
        ])
        .sort({ createdAt: -1 });

      const lastmonthlastdate = moment()
        .subtract(1, "months")
        .startOf("month")
        .format("YYYY-MM-DD");
      const lastmonthfirstdate = moment()
        .subtract(1, "months")
        .endOf("month")
        .format("YYYY-MM-DD");
      const currentmonthfirstdate = moment().startOf("month").format("YYYY-MM-DD");
      const currentmonthlastdate = moment().endOf("month").format("YYYY-MM-DD");

      const previousMonthsData = await Test.aggregate([
        {
          $match: {
            status: "Test Completed",
            createdAt: {
              $gte: new Date(lastmonthfirstdate),
              $lt: new Date(lastmonthlastdate),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalSaleAmount: { $sum: "$total_cost" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalSaleAmount: -1 } },
      ]);
      const currentMonthsData = await Test.aggregate([
        {
          $match: {
            status: "Test Completed",
            createdAt: {
              $gte: new Date(currentmonthfirstdate),
              $lt: new Date(currentmonthlastdate),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalSaleAmount: { $sum: "$total_cost" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalSaleAmount: -1 } },
      ]);

      let percentage = 100;
      if (previousMonthsData.length > 0 && currentMonthsData.length > 0) {
        percentage =
          ((currentMonthsData[0].totalSaleAmount -
            previousMonthsData[0].totalSaleAmount) /
            previousMonthsData[0].totalSaleAmount) *
          100;
      } else if (
        (previousMonthsData.length > 0 && currentMonthsData.length < 1) ||
        (previousMonthsData.length < 1 && currentMonthsData.length < 1)
      ) {
        percentage = 0;
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        percentage,
      });
    }

    const allRecords = await Test.find()
      .populate([
        { path: "patient" },
        { path: "user" },
        {
          path: "payment",
          populate: {
            path: "user",
            populate: {
              path: "role",
            },
          },
        },
        { path: "invoice" },
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

  const Test = getTestModel(tenant.connection);
  const Patient = getPatientModel(tenant.connection);
  const Invoice = getInvoiceModel(tenant.connection);
  const conn = tenant.connection;

  try {
    const body = await req.json();
    const transactionSession = await conn.startSession();
    const testProcess = await transactionSession.withTransaction(async () => {
      // Every operation below must pass {session: transactionSession}
      // explicitly - simply being inside this callback does not enrol a
      // query in the transaction, and the previous version of this code
      // didn't pass it anywhere, so the "transaction" never actually
      // provided atomicity between the test create and the patient
      // update. That's a real correctness gap now that a third write
      // (the invoice) has to succeed or fail together with the other two.
      const [testData] = await Test.create(
        [{ ...body, user: session.user?._id }],
        { session: transactionSession }
      );

      const updatePatient = await Patient.findOneAndUpdate(
        { _id: new ObjectId(body.patient) },
        { $push: { tests: testData._id } },
        { session: transactionSession }
      );

      const invoiceNumber = await nextInvoiceNumber(conn, transactionSession);
      const [invoice] = await Invoice.create(
        [
          {
            invoiceNumber,
            test: testData._id,
            patient: testData.patient,
            amount: testData.total_cost,
            status: "Unpaid",
          },
        ],
        { session: transactionSession }
      );

      testData.invoice = invoice._id;
      await testData.save({ session: transactionSession });

      return { testData, updatePatient, invoice };
    });
    transactionSession.endSession();

    await logActivity(
      tenant.connection,
      session,
      "invoice.created",
      `Invoice ${testProcess?.invoice?.invoiceNumber} created for "${
        testProcess?.testData?.test_title
      }" (${formatCurrency(testProcess?.testData?.total_cost)}) - ${
        testProcess?.updatePatient?.firstname ?? ""
      } ${testProcess?.updatePatient?.lastname ?? ""}`.trim()
    );

    return NextResponse.json({ success: true, data: testProcess }, { status: 201 });
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

  const Test = getTestModel(tenant.connection);

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

    // Completeness is derived from the submitted results themselves rather
    // than a client-supplied count (which was trivially wrong - it counted
    // DOM element objects, not their values, so it was always 0 and every
    // save silently marked the test "Test Completed" regardless of how many
    // fields were actually left blank).
    let status: "Test Completed" | undefined;
    try {
      const parsedTestData = JSON.parse(body.test_data);
      const hasBlankValue = parsedTestData.some(
        (item: any) => !String(item?.parameter?.value ?? "").trim()
      );
      status = hasBlankValue ? undefined : "Test Completed";
    } catch {
      status = undefined;
    }

    const update: Record<string, any> = { test_data: body.test_data };
    if (status) update.status = status;
    if (body.labRemark !== undefined) {
      update.labRemark = body.labRemark;
      update.remarkAiAssisted = Boolean(body.remarkAiAssisted);
    }

    const updateTest = await Test.findOneAndUpdate(
      { _id: put_id },
      update,
      { new: true }
    ).populate([
      {
        path: "payment",
        populate: {
          path: "user",
        },
      },
    ]);

    await logActivity(
      tenant.connection,
      session,
      status === "Test Completed" ? "test.completed" : "test.result_updated",
      status === "Test Completed"
        ? `Completed results for "${updateTest?.test_title}"`
        : `Saved partial results for "${updateTest?.test_title}"`
    );

    return NextResponse.json({ success: true, data: updateTest });
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

  const Test = getTestModel(tenant.connection);

  try {
    const body = await req.json();
    const delete_id = body.delete_id;
    if (!delete_id) {
      return NextResponse.json(
        { success: false, error: "Unprocessed delete_id" },
        { status: 400 }
      );
    }

    const test = await Test.findById(delete_id);
    const deleteTestResponse = await Test.deleteOne({ _id: delete_id });
    await logActivity(
      tenant.connection,
      session,
      "test.deleted",
      `Deleted test "${test?.test_title ?? delete_id}"`
    );
    return NextResponse.json({ success: true, data: deleteTestResponse });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
