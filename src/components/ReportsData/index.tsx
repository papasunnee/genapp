"use client";

import { useState } from "react";
import useSWR from "swr";
import moment from "moment";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/functions";
import UpgradeNotice from "@/components/ui/UpgradeNotice";
import Skeleton from "@/components/ui/Skeleton";
import {
  TABLE_CARD_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_TH_CLASS,
  TABLE_TR_CLASS,
  TABLE_TD_CLASS,
} from "@/components/ui/table";

function csvEscape(value: any): string {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ReportsData() {
  const [month, setMonth] = useState(moment().format("YYYY-MM"));
  const { data, isLoading }: any = useSWR(`/api/reports/monthly?month=${month}`, fetcher);

  const report = data?.data;
  const limited = data?.success === false;

  const handleDownloadCsv = () => {
    if (!report) return;
    const rows: (string | number)[][] = [
      [`Monthly Report - ${report.monthLabel}`],
      [],
      ["Summary"],
      ["Total Revenue", report.revenueTotal],
      ["Tests Completed", report.testsCompletedTotal],
      [],
      ["Revenue by Day"],
      ["Day", "Revenue"],
      ...report.revenueByDay.map((r: any) => [r.day, r.revenue]),
      [],
      ["Test Volume by Type"],
      ["Test", "Count", "Revenue"],
      ...report.testsByCategory.map((t: any) => [t.testTitle, t.count, t.revenue]),
    ];
    downloadCsv(`report-${report.month}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      <div className={TABLE_CARD_CLASS}>
        <div className={`${TABLE_HEADER_CLASS} flex flex-wrap items-center gap-3`}>
          <div className="flex-grow">
            <h6 className="text-slate-800 text-md md:text-lg font-semibold">Monthly Report</h6>
            <span className="font-normal text-xs md:text-sm text-slate-400">
              Revenue and test-volume summary for accounting or regulatory submission
            </span>
          </div>
          <input
            type="month"
            value={month}
            max={moment().format("YYYY-MM")}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-slate-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="button"
            disabled={!report}
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold uppercase px-4 py-2.5 rounded-lg transition-colors"
          >
            <i className="fas fa-file-csv"></i>
            Download CSV
          </button>
          <button
            type="button"
            disabled={!report}
            onClick={() => window.open(`/print/reports/monthly?month=${month}`, "_blank")}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold uppercase px-4 py-2.5 rounded-lg transition-colors"
          >
            <i className="fas fa-print"></i>
            Print / Save PDF
          </button>
        </div>

        {limited && (
          <div className="px-6 pt-4 pb-2">
            <UpgradeNotice title="Report unavailable" message={data.error} />
          </div>
        )}

        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : report ? (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {formatCurrency(report.revenueTotal)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Tests Completed
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {report.testsCompletedTotal}
                </p>
              </div>
            </div>

            <div>
              <h6 className="text-slate-400 text-xs mb-3 font-semibold uppercase tracking-wide">
                Test Volume by Type
              </h6>
              {report.testsByCategory.length > 0 ? (
                <div className="block w-full overflow-x-auto rounded-lg border border-slate-200">
                  <table className="items-center w-full bg-transparent border-collapse">
                    <thead>
                      <tr>
                        <th className={TABLE_TH_CLASS}>Test</th>
                        <th className={TABLE_TH_CLASS}>Completed</th>
                        <th className={TABLE_TH_CLASS}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.testsByCategory.map((t: any) => (
                        <tr key={t.testTitle} className={TABLE_TR_CLASS}>
                          <th className="px-6 align-middle text-sm p-3 text-left font-medium text-slate-700">
                            {t.testTitle}
                          </th>
                          <td className={TABLE_TD_CLASS}>{t.count}</td>
                          <td className={TABLE_TD_CLASS}>{formatCurrency(t.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No tests were completed in {report.monthLabel}.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
