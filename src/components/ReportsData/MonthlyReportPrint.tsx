"use client";

import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import moment from "moment";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/functions";
import Skeleton from "@/components/ui/Skeleton";

export default function MonthlyReportPrint() {
  const searchParams = useSearchParams();
  const month = searchParams.get("month") || moment().format("YYYY-MM");

  const { data, isLoading }: any = useSWR(`/api/reports/monthly?month=${month}`, fetcher);
  const { data: brandingData }: any = useSWR("/api/organization/branding", fetcher);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto mt-16 space-y-3 px-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (data?.success === false || !data?.data) {
    return (
      <div className="mx-auto mt-16 text-center text-sm text-red-600">
        {data?.error || "Failed to load this report."}
      </div>
    );
  }

  const report = data.data;
  const branding = brandingData?.data;

  return (
    <div className="bg-slate-100 min-h-screen py-8 print:bg-white print:py-0">
      <div
        className="mx-auto bg-white shadow-sm print:shadow-none max-w-full"
        style={{ width: "210mm" }}
      >
        <div className="px-8 pt-6 pb-3 print:px-6 print:pt-3 print:pb-2 flex items-start justify-between border-b-4 border-brand-700">
          <div className="flex items-center gap-3">
            {branding?.logo ? (
              <img
                src={branding.logo}
                alt={branding?.name || "Organization logo"}
                className="h-14 w-14 print:h-10 print:w-10 object-contain"
              />
            ) : (
              <div className="h-14 w-14 print:h-10 print:w-10 rounded-full bg-brand-700 text-white flex items-center justify-center flex-shrink-0">
                <i className="fas fa-flask text-xl"></i>
              </div>
            )}
            <div>
              <h1 className="text-xl print:text-lg font-black uppercase text-brand-800 tracking-tight leading-none">
                {branding?.name || "Laboratory"}
              </h1>
              {branding?.address && (
                <p className="text-xs text-slate-400 mt-1">{branding.address}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">
              Monthly Report
            </h2>
            <p className="text-sm text-slate-500 mt-1">{report.monthLabel}</p>
          </div>
        </div>

        <div className="px-8 py-4 print:px-6 print:py-2 grid grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Total Revenue
            </p>
            <p className="text-lg font-bold text-emerald-700 mt-0.5">
              {formatCurrency(report.revenueTotal)}
            </p>
          </div>
          <div className="border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Tests Completed
            </p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">
              {report.testsCompletedTotal}
            </p>
          </div>
        </div>

        <div className="px-8 pb-6 print:px-6 print:pb-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Test Volume by Type
          </p>
          <table className="w-full text-sm border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="text-left px-3 py-2 font-semibold">Test</th>
                <th className="text-right px-3 py-2 font-semibold">Completed</th>
                <th className="text-right px-3 py-2 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {report.testsByCategory.length > 0 ? (
                report.testsByCategory.map((t: any) => (
                  <tr key={t.testTitle} className="border-b border-slate-200">
                    <td className="px-3 py-2 text-slate-700">{t.testTitle}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{t.count}</td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-800">
                      {formatCurrency(t.revenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-slate-400">
                    No tests completed this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center mt-6 print:hidden">
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
          onClick={() => window.print()}
        >
          <i className="fas fa-print"></i>
          Print
        </button>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
