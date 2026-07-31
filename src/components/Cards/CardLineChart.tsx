"use client";

import useSWR from "swr";
import { Line } from "react-chartjs-2";
import "@/lib/chartSetup";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/functions";
import Skeleton from "@/components/ui/Skeleton";

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "nearest" as const, intersect: true },
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: "index" as const,
      intersect: false,
      callbacks: {
        label: (ctx: any) => formatCurrency(ctx.parsed.y),
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#94a3b8" },
    },
    y: {
      grid: { color: "rgba(148, 163, 184, 0.2)" },
      ticks: { color: "#94a3b8" },
    },
  },
};

export default function CardLineChart() {
  const { data, isLoading }: any = useSWR("/api/dashboard", fetcher);
  const monthlyTrend = data?.data?.monthlyTrend ?? [];

  const chartData = {
    labels: monthlyTrend.map((m: any) => m.month),
    datasets: [
      {
        label: "Revenue",
        backgroundColor: "#2563eb",
        borderColor: "#2563eb",
        data: monthlyTrend.map((m: any) => m.revenue),
        fill: false,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-slate-400 mb-1 text-xs font-semibold tracking-wide">
              Last 6 Months
            </h6>
            <h2 className="text-slate-800 text-xl font-semibold">Revenue Trend</h2>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        <div className="relative h-350-px">
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <Line data={chartData} options={options} />
          )}
        </div>
      </div>
    </div>
  );
}
