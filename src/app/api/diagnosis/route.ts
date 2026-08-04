import { NextResponse } from "next/server";
import { Types, Connection } from "mongoose";
import moment from "moment";
import { getTestModel } from "@/models/Test";
import { getPatientModel } from "@/models/Patient";
import { getUserModel } from "@/models/User";
import { getPaymentModel } from "@/models/Payment";
import { getRoleModel } from "@/models/Role";
import { getInvoiceModel } from "@/models/Invoice";
import { getTestCategoryModel } from "@/models/TestCategory";
import { withTenant } from "@/lib/apiTenant";
import { hasPermission } from "@/lib/permissions";
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
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: "Invalid test id" },
          { status: 400 }
        );
      }
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
      // No caller passes any filter fields beyond `filter` itself - the
      // previous version of this branch built its Mongo filter straight
      // from `Object.fromEntries(searchParams.entries())`, which would
      // hand a raw query operator (e.g. `?$where=...`) directly to
      // `Test.find()` if a caller ever sent one. Since this branch only
      // exists to compute the month-over-month revenue stats below (which
      // need every test, not a filtered subset), it never needed a filter
      // object at all.
      const filteredData = await Test.find()
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

const CREATABLE_TEST_FIELDS = [
  "test_title",
  "specimen",
  "clinical_address",
  "clinical_diagnosis",
  "test_data",
] as const;

/**
 * The client computes a total_cost for display (summing catalog prices for
 * whatever it has selected) and used to send that number straight through
 * into both the Test record and its Invoice - meaning any direct API call
 * could set an invoice to any amount at all, including 0 or negative. The
 * authoritative price is always looked up here from the tenant's own test
 * catalog by parameter id, never trusted from the request body.
 */
async function computeAuthoritativeCost(
  connection: Connection,
  testDataJson: unknown
): Promise<number> {
  if (typeof testDataJson !== "string") return 0;

  let items: any[];
  try {
    items = JSON.parse(testDataJson);
  } catch {
    return 0;
  }
  if (!Array.isArray(items)) return 0;

  const parameterIds = items
    .map((item) => item?.parameter?.id)
    .filter((id): id is string => typeof id === "string");
  if (parameterIds.length === 0) return 0;

  const TestCategory = getTestCategoryModel(connection);
  const categories = await TestCategory.find();

  const costById = new Map<string, number>();
  for (const category of categories) {
    for (const parameter of category.parameters || []) {
      costById.set(parameter.id, parameter.cost || 0);
    }
    for (const type of category.type || []) {
      for (const parameter of type.parameters || []) {
        costById.set(parameter.id, parameter.cost || 0);
      }
    }
  }

  return parameterIds.reduce((sum, id) => sum + (costById.get(id) || 0), 0);
}

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

    if (typeof body.patient !== "string" || !ObjectId.isValid(body.patient)) {
      return NextResponse.json(
        { success: false, error: "A valid patient must be selected" },
        { status: 400 }
      );
    }
    if (typeof body.test_title !== "string" || !body.test_title.trim()) {
      return NextResponse.json(
        { success: false, error: "Test title is required" },
        { status: 400 }
      );
    }

    const testFields: Record<string, any> = { user: session.user?._id };
    for (const field of CREATABLE_TEST_FIELDS) {
      if (body[field] !== undefined) testFields[field] = body[field];
    }
    testFields.total_cost = await computeAuthoritativeCost(
      tenant.connection,
      body.test_data
    );

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
        [{ ...testFields, patient: new ObjectId(body.patient) }],
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
  // Editing results is a clinical action - Super Admin/Admin/Lab
  // Technician only, matching the same allow-list the AI remark-suggestion
  // endpoint already uses for this kind of work.
  if (!hasPermission(session.user?.role, "editResults")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const Test = getTestModel(tenant.connection);

  try {
    const body = await req.json();
    const put_id = body.put_id;
    if (typeof put_id !== "string" || !ObjectId.isValid(put_id)) {
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
  // Permanently deleting a test record is destructive and irreversible -
  // Super Admin/Admin only, same tier as voiding an invoice.
  if (!hasPermission(session.user?.role, "deleteRecords")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const Test = getTestModel(tenant.connection);

  try {
    const body = await req.json();
    const delete_id = body.delete_id;
    if (typeof delete_id !== "string" || !ObjectId.isValid(delete_id)) {
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
