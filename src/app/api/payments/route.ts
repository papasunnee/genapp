import { NextRequest, NextResponse } from "next/server";
import moment from "moment";
import { getTestModel } from "@/models/Test";
import { getPatientModel } from "@/models/Patient";
import { getPaymentModel } from "@/models/Payment";
import { getUserModel } from "@/models/User";
import { getRoleModel } from "@/models/Role";
import { getInvoiceModel } from "@/models/Invoice";
import { withTenant } from "@/lib/apiTenant";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Payments list: test orders joined with their patient and payment (if
 * any), with server-side search/filter/pagination and a stats summary -
 * all computed in one aggregation so the stat cards reflect search/date/
 * payment-method filters but never the table's own status filter (which
 * would otherwise make the status stat cards circular with themselves).
 */
export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Registered so $lookup can resolve them on this tenant's connection.
  const Test = getTestModel(tenant.connection);
  getPatientModel(tenant.connection);
  getPaymentModel(tenant.connection);
  getUserModel(tenant.connection);
  getRoleModel(tenant.connection);
  getInvoiceModel(tenant.connection);

  try {
    const params = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(params.get("limit") || "10", 10) || 10));
    const status = params.get("status");
    const paymentOption = params.get("paymentOption");
    const search = params.get("search")?.trim();
    const from = params.get("from");
    const to = params.get("to");

    const baseMatch: Record<string, any>[] = [];
    if (paymentOption && paymentOption !== "All") {
      baseMatch.push({ "payment.payment_option": paymentOption });
    }
    if (from) {
      baseMatch.push({ createdAt: { $gte: moment(from).startOf("day").toDate() } });
    }
    if (to) {
      baseMatch.push({ createdAt: { $lte: moment(to).endOf("day").toDate() } });
    }
    if (search) {
      const regex = { $regex: escapeRegex(search), $options: "i" };
      baseMatch.push({
        $or: [
          { test_title: regex },
          { "patient.firstname": regex },
          { "patient.lastname": regex },
          { "invoice.invoiceNumber": regex },
        ],
      });
    }

    const statusMatchStage =
      status && status !== "All" ? [{ $match: { status } }] : [];

    const pipeline: any[] = [
      {
        $lookup: {
          from: "patients",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "invoices",
          localField: "invoice",
          foreignField: "_id",
          as: "invoice",
        },
      },
      { $unwind: { path: "$invoice", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "payments",
          localField: "payment",
          foreignField: "_id",
          as: "payment",
        },
      },
      { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "payment.user",
          foreignField: "_id",
          as: "payment.user",
        },
      },
      { $unwind: { path: "$payment.user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "roles",
          localField: "payment.user.role",
          foreignField: "_id",
          as: "payment.user.role",
        },
      },
      { $unwind: { path: "$payment.user.role", preserveNullAndEmptyArrays: true } },
      ...(baseMatch.length ? [{ $match: { $and: baseMatch } }] : []),
      {
        $facet: {
          data: [
            ...statusMatchStage,
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          totalCount: [...statusMatchStage, { $count: "count" }],
          statusBreakdown: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          revenue: [
            { $match: { payment: { $ne: null } } },
            {
              $group: {
                _id: null,
                total: { $sum: "$payment.amount_paid" },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ];

    const [result] = await Test.aggregate(pipeline);

    const total = result.totalCount[0]?.count ?? 0;
    const statusCounts: Record<string, number> = {};
    for (const entry of result.statusBreakdown) {
      statusCounts[entry._id] = entry.count;
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      stats: {
        totalRevenue: result.revenue[0]?.total ?? 0,
        transactionCount: result.revenue[0]?.count ?? 0,
        completedCount: statusCounts["Test Completed"] ?? 0,
        awaitingPaymentCount: statusCounts["Awaiting Payment"] ?? 0,
        awaitingResultCount: statusCounts["Awaiting Result"] ?? 0,
        cancelledCount: statusCounts["Cancelled"] ?? 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
});
