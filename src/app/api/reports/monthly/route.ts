import { NextResponse } from "next/server";
import moment from "moment";
import { getTestModel } from "@/models/Test";
import { getPaymentModel } from "@/models/Payment";
import { withTenant } from "@/lib/apiTenant";
import { getPlanLimits } from "@/lib/planLimits";

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const monthParam = req.nextUrl.searchParams.get("month") || moment().format("YYYY-MM");
  const month = moment(monthParam, "YYYY-MM", true);
  if (!month.isValid()) {
    return NextResponse.json({ success: false, error: "Invalid month" }, { status: 400 });
  }

  const limits = getPlanLimits(tenant.organization);
  const oldestAllowed = moment().subtract(limits.analyticsHistoryMonths - 1, "months").startOf("month");
  if (month.isBefore(oldestAllowed, "month")) {
    return NextResponse.json(
      {
        success: false,
        error: `Your ${tenant.organization.plan} plan only keeps ${limits.analyticsHistoryMonths} month(s) of report history. Upgrade to go further back.`,
      },
      { status: 403 }
    );
  }

  const Test = getTestModel(tenant.connection);
  const Payment = getPaymentModel(tenant.connection);
  const rangeStart = month.clone().startOf("month").toDate();
  const rangeEnd = month.clone().endOf("month").toDate();
  const daysInMonth = month.daysInMonth();

  try {
    const [revenueByDayAgg, revenueTotalAgg, testsByCategoryAgg, testsCompletedTotalAgg] =
      await Promise.all([
        Payment.aggregate([
          { $match: { createdAt: { $gte: rangeStart, $lte: rangeEnd } } },
          {
            $group: {
              _id: { $dayOfMonth: "$createdAt" },
              total: { $sum: "$amount_paid" },
            },
          },
        ]),
        Payment.aggregate([
          { $match: { createdAt: { $gte: rangeStart, $lte: rangeEnd } } },
          { $group: { _id: null, total: { $sum: "$amount_paid" } } },
        ]),
        Test.aggregate([
          {
            $match: {
              status: "Test Completed",
              updatedAt: { $gte: rangeStart, $lte: rangeEnd },
            },
          },
          {
            $group: {
              _id: "$test_title",
              count: { $sum: 1 },
              revenue: { $sum: "$total_cost" },
            },
          },
          { $sort: { count: -1 } },
        ]),
        Test.countDocuments({
          status: "Test Completed",
          updatedAt: { $gte: rangeStart, $lte: rangeEnd },
        }),
      ]);

    const revenueByDayMap = new Map(revenueByDayAgg.map((r) => [r._id, r.total]));
    const revenueByDay = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      revenue: revenueByDayMap.get(i + 1) ?? 0,
    }));

    const testsByCategory = testsByCategoryAgg.map((t) => ({
      testTitle: t._id || "Untitled test",
      count: t.count,
      revenue: t.revenue,
    }));

    return NextResponse.json({
      success: true,
      data: {
        month: month.format("YYYY-MM"),
        monthLabel: month.format("MMMM YYYY"),
        revenueTotal: revenueTotalAgg[0]?.total ?? 0,
        testsCompletedTotal: testsCompletedTotalAgg,
        revenueByDay,
        testsByCategory,
        oldestAllowedMonth: oldestAllowed.format("YYYY-MM"),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
