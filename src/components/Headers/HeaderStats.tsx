"use client";

import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/functions";
import CardStats from "../Cards/CardStats";
import CardStatsSkeleton from "../Cards/CardStatsSkeleton";

const TREND_COLOR: Record<string, string> = {
  up: "text-emerald-600",
  down: "text-red-600",
  flat: "text-slate-400",
};

export default function HeaderStats() {
  const { data, isLoading }: any = useSWR("/api/dashboard", fetcher);
  const stats = data?.data;

  const cards = stats
    ? [
        {
          key: "patients",
          subtitle: "PATIENTS",
          title: stats.patients.total,
          arrow: stats.patients.trendDirection,
          percent: stats.patients.trendPercent,
          percentColor: TREND_COLOR[stats.patients.trendDirection],
          iconName: "fas fa-user",
        },
        {
          key: "staff",
          subtitle: "STAFF / USERS",
          title: stats.staff.total,
          arrow: stats.staff.trendDirection,
          percent: stats.staff.trendPercent,
          percentColor: TREND_COLOR[stats.staff.trendDirection],
          iconName: "fas fa-users",
        },
        {
          key: "results",
          subtitle: "RESULTS",
          title: stats.testsCompleted.total,
          arrow: stats.testsCompleted.trendDirection,
          percent: stats.testsCompleted.trendPercent,
          percentColor: TREND_COLOR[stats.testsCompleted.trendDirection],
          iconName: "far fa-chart-bar",
        },
        {
          key: "revenue",
          subtitle: "REVENUE (MTD)",
          title: formatCurrency(stats.revenue.total),
          arrow: stats.revenue.trendDirection,
          percent: stats.revenue.trendPercent,
          percentColor: TREND_COLOR[stats.revenue.trendDirection],
          iconName: "fas fa-money-bill-wave",
        },
      ]
    : [];

  return (
    <header className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="flex flex-wrap">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-full sm:w-6/12 xl:w-3/12 px-4 mb-6 xl:mb-0"
              >
                <CardStatsSkeleton />
              </div>
            ))
          ) : (
            cards.map((stat) => (
              <div
                key={stat.key}
                className="w-full sm:w-6/12 xl:w-3/12 px-4 mb-6 xl:mb-0"
              >
                <CardStats
                  statSubtitle={stat.subtitle}
                  statTitle={stat.title}
                  statArrow={stat.arrow}
                  statPercent={stat.percent}
                  statPercentColor={stat.percentColor}
                  statDescripiron="Since last month"
                  statIconName={stat.iconName}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </header>
  );
}
