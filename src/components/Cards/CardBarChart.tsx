"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import "@/lib/chartSetup";

const currentYear = new Date().getFullYear();

const data = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: currentYear.toString(),
      backgroundColor: "#2563eb",
      borderColor: "#2563eb",
      data: [30, 78, 56, 34, 100, 45, 13],
      barThickness: 8,
    },
    {
      label: (currentYear - 1).toString(),
      backgroundColor: "#cbd5e1",
      borderColor: "#cbd5e1",
      data: [27, 68, 86, 74, 10, 4, 87],
      barThickness: 8,
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
      labels: { color: "rgba(0,0,0,.6)" },
    },
    tooltip: { mode: "index" as const, intersect: false },
  },
  scales: {
    x: {
      display: false,
    },
    y: {
      grid: { color: "rgba(33, 37, 41, 0.2)" },
    },
  },
};

export default function CardBarChart() {
  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-slate-400 mb-1 text-xs font-semibold tracking-wide">
              Performance
            </h6>
            <h2 className="text-slate-700 text-xl font-semibold">Total orders</h2>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        <div className="relative h-350-px">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
