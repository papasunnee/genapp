import { NextResponse } from "next/server";
import { Types } from "mongoose";
import moment from "moment";
import { getTestModel } from "@/models/Test";
import { getPatientModel } from "@/models/Patient";
import { getUserModel } from "@/models/User";
import { getPaymentModel } from "@/models/Payment";
import { getRoleModel } from "@/models/Role";
import { withTenant } from "@/lib/apiTenant";

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
  const conn = tenant.connection;

  try {
    const body = await req.json();
    const transactionSession = await conn.startSession();
    const testProcess = await transactionSession.withTransaction(async () => {
      const testData = await Test.create({
        ...body,
        user: session.user?._id,
      });

      const updatePatient = await Patient.findOneAndUpdate(
        { _id: new ObjectId(body.patient) },
        { $push: { tests: testData._id } }
      );

      return { testData, updatePatient };
    });
    transactionSession.endSession();

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
    const status =
      body.nullTestValuesCount > 1 ? undefined : "Test Completed";

    const updateTest = await Test.findOneAndUpdate(
      { _id: put_id },
      status ? { test_data: body.test_data, status } : { test_data: body.test_data },
      { new: true }
    ).populate([
      {
        path: "payment",
        populate: {
          path: "user",
        },
      },
    ]);

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

    const deleteTestResponse = await Test.deleteOne({ _id: delete_id });
    return NextResponse.json({ success: true, data: deleteTestResponse });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
