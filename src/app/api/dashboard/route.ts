import { NextResponse } from "next/server";
import moment from "moment";
import { getPatientModel } from "@/models/Patient";
import { getUserModel } from "@/models/User";
import { getTestModel } from "@/models/Test";
import { getPaymentModel } from "@/models/Payment";
import { withTenant } from "@/lib/apiTenant";

function trendPercent(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function trendDirection(percent: number): "up" | "down" | "flat" {
  if (percent > 0) return "up";
  if (percent < 0) return "down";
  return "flat";
}

/**
 * `total` is the all-time headline figure; the trend is a separate
 * this-month-vs-last-month comparison, not a comparison against the
 * (much larger) all-time total.
 */
function metric(total: number, thisMonth: number, lastMonth: number) {
  const percent = trendPercent(thisMonth, lastMonth);
  return { total, trendPercent: Math.abs(percent), trendDirection: trendDirection(percent) };
}

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Patient = getPatientModel(tenant.connection);
  const User = getUserModel(tenant.connection);
  const Test = getTestModel(tenant.connection);
  const Payment = getPaymentModel(tenant.connection);

  try {
    const startOfThisMonth = moment().startOf("month").toDate();
    const startOfLastMonth = moment().subtract(1, "month").startOf("month").toDate();

    const [
      patientsTotal,
      patientsThisMonth,
      patientsLastMonth,
      staffTotal,
      staffThisMonth,
      staffLastMonth,
      testsCompletedTotal,
      testsCompletedThisMonth,
      testsCompletedLastMonth,
      awaitingPayment,
      awaitingResult,
      recentTests,
    ] = await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Patient.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      Test.countDocuments({ status: "Test Completed" }),
      Test.countDocuments({ status: "Test Completed", updatedAt: { $gte: startOfThisMonth } }),
      Test.countDocuments({
        status: "Test Completed",
        updatedAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      Test.countDocuments({ status: "Awaiting Payment" }),
      Test.countDocuments({ status: "Awaiting Result" }),
      Test.find()
        .populate("patient")
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    const [revenueThisMonthAgg, revenueLastMonthAgg] = await Promise.all([
      Payment.aggregate([
        { $match: { createdAt: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: "$amount_paid" } } },
      ]),
      Payment.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: "$amount_paid" } } },
      ]),
    ]);
    const revenueThisMonth = revenueThisMonthAgg[0]?.total ?? 0;
    const revenueLastMonth = revenueLastMonthAgg[0]?.total ?? 0;

    // Last 6 months of revenue + completed-test volume, always emitting
    // exactly 6 buckets (even ones with zero activity) so the chart looks
    // right for a brand-new tenant with little history, not just
    // established ones.
    const monthsBack = 6;
    const rangeStart = moment().subtract(monthsBack - 1, "months").startOf("month").toDate();

    const [revenueByMonth, testsByMonth] = await Promise.all([
      Payment.aggregate([
        { $match: { createdAt: { $gte: rangeStart } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            total: { $sum: "$amount_paid" },
          },
        },
      ]),
      Test.aggregate([
        { $match: { status: "Test Completed", updatedAt: { $gte: rangeStart } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const revenueByKey = new Map(revenueByMonth.map((r) => [r._id, r.total]));
    const testsByKey = new Map(testsByMonth.map((r) => [r._id, r.count]));

    const monthlyTrend = Array.from({ length: monthsBack }, (_, i) => {
      const m = moment().subtract(monthsBack - 1 - i, "months");
      const key = m.format("YYYY-MM");
      return {
        month: m.format("MMM"),
        revenue: revenueByKey.get(key) ?? 0,
        testsCompleted: testsByKey.get(key) ?? 0,
      };
    });

    const recentActivity = recentTests.map((t: any) => ({
      id: t._id.toString(),
      testTitle: t.test_title,
      patientName: t.patient
        ? `${t.patient.firstname} ${t.patient.lastname}`
        : "Unknown patient",
      status: t.status,
      at: t.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        patients: metric(patientsTotal, patientsThisMonth, patientsLastMonth),
        staff: metric(staffTotal, staffThisMonth, staffLastMonth),
        testsCompleted: metric(
          testsCompletedTotal,
          testsCompletedThisMonth,
          testsCompletedLastMonth
        ),
        revenue: metric(revenueThisMonth, revenueThisMonth, revenueLastMonth),
        monthlyTrend,
        pendingActions: { awaitingPayment, awaitingResult },
        recentActivity,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
