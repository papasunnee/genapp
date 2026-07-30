"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import "@/lib/chartSetup";

const currentYear = new Date().getFullYear();

const data = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: currentYear.toString(),
      backgroundColor: "#2563eb",
      borderColor: "#2563eb",
      data: [65, 78, 66, 44, 56, 67, 75],
      fill: false,
    },
    {
      label: (currentYear - 1).toString(),
      fill: false,
      backgroundColor: "#cbd5e1",
      borderColor: "#cbd5e1",
      data: [40, 68, 86, 74, 56, 60, 87],
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "nearest" as const, intersect: true },
  plugins: {
    legend: {
      align: "end" as const,
      position: "bottom" as const,
      labels: { color: "#475569" },
    },
    tooltip: { mode: "index" as const, intersect: false },
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
  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-slate-400 mb-1 text-xs font-semibold tracking-wide">
              Overview
            </h6>
            <h2 className="text-slate-800 text-xl font-semibold">Sales value</h2>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        <div className="relative h-350-px">
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
