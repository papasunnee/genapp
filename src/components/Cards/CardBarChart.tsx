"use client";

import useSWR from "swr";
import { Bar } from "react-chartjs-2";
import "@/lib/chartSetup";
import { fetcher } from "@/utils/fetcher";
import Skeleton from "@/components/ui/Skeleton";

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "nearest" as const, intersect: true },
  plugins: {
    legend: { display: false },
    tooltip: { mode: "index" as const, intersect: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#94a3b8" },
    },
    y: {
      grid: { color: "rgba(33, 37, 41, 0.1)" },
      ticks: { color: "#94a3b8", precision: 0 },
    },
  },
};

export default function CardBarChart() {
  const { data, isLoading }: any = useSWR("/api/dashboard", fetcher);
  const monthlyTrend = data?.data?.monthlyTrend ?? [];

  const chartData = {
    labels: monthlyTrend.map((m: any) => m.month),
    datasets: [
      {
        label: "Tests Completed",
        backgroundColor: "#2563eb",
        borderColor: "#2563eb",
        data: monthlyTrend.map((m: any) => m.testsCompleted),
        barThickness: 12,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-slate-400 mb-1 text-xs font-semibold tracking-wide">
              Last 6 Months
            </h6>
            <h2 className="text-slate-700 text-xl font-semibold">Tests Completed</h2>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        <div className="relative h-350-px">
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </div>
      </div>
    </div>
  );
}
