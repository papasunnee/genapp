"use client";

import { use } from "react";
import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import { printAge } from "@/utils/functions";
import moment from "moment";
import Skeleton from "@/components/ui/Skeleton";

function InfoCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-slate-200 px-3 py-2 print:px-2 print:py-1 break-inside-avoid">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
        {value || "N/A"}
      </p>
    </div>
  );
}

export default function TestPrintPage({
  params,
}: {
  params: Promise<{ user: string; id: string }>;
}) {
  const { id, user } = use(params);

  const {
    data: testData,
    error,
    isLoading,
  }: any = useSWR(`/api/diagnosis/test?testId=${id}&patientId=${user}`, fetcher);

  const { data: brandingData }: any = useSWR("/api/organization/branding", fetcher);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto mt-16 space-y-3 px-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-16 text-center text-sm text-red-600">
        Failed to load this report.
      </div>
    );
  }

  const test = testData?.data?.tests?.[0];
  const branding = brandingData?.data;
  const reportNo = test?._id ? String(test._id).slice(-8).toUpperCase() : "N/A";

  const resultItems: any[] = testData?.resultArray || [];
  const numericItems = resultItems.filter((i) => i.parameter.resultType !== "text");
  const textItems = resultItems.filter((i) => i.parameter.resultType === "text");
  const hasContactFooter = branding?.address || branding?.phone || branding?.contactEmail;

  return (
    <div className="bg-slate-100 min-h-screen py-8 print:bg-white print:py-0">
      <div
        className="mx-auto bg-white shadow-sm print:shadow-none max-w-full"
        style={{ width: "210mm" }}
      >
        <div className="px-8 pt-6 pb-3 print:px-6 print:pt-3 print:pb-2 flex items-start justify-between border-b-4 border-brand-700 break-inside-avoid">
          <div className="flex items-center gap-3">
            {branding?.logo ? (
              <img
                src={branding.logo}
                alt={branding?.name || "Organization logo"}
                className="h-14 w-14 print:h-10 print:w-10 object-contain"
              />
            ) : (
              <div className="h-14 w-14 print:h-10 print:w-10 rounded-full bg-brand-700 text-white flex items-center justify-center flex-shrink-0">
                <i className="fas fa-flask text-2xl print:text-lg"></i>
              </div>
            )}
            <div>
              <h1 className="text-xl print:text-lg font-black uppercase text-brand-800 tracking-tight leading-none">
                {branding?.name || "Laboratory"}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Diagnostics &amp; Laboratory Services
              </p>
            </div>
          </div>
          {branding?.tagline && (
            <p className="text-xs italic text-slate-500 mt-2 text-right max-w-[220px]">
              {branding.tagline}
            </p>
          )}
        </div>

        <div className="px-8 py-1.5 print:px-6 print:py-1 flex items-center justify-between bg-slate-50 border-b border-slate-200 text-xs break-inside-avoid">
          <span className="font-semibold text-slate-600">
            STATUS:{" "}
            <span
              className={
                test?.status === "Test Completed" ? "text-emerald-700" : "text-orange-700"
              }
            >
              {test?.status || "N/A"}
            </span>
          </span>
          <span className="font-semibold text-slate-600">REPORT NO: {reportNo}</span>
        </div>

        <div className="px-8 py-3 print:px-6 print:py-2">
          <div className="grid grid-cols-3">
            <InfoCell
              label="Patient Name"
              value={`${testData?.data?.firstname ?? ""} ${testData?.data?.lastname ?? ""}`.trim()}
            />
            <InfoCell
              label="Age"
              value={testData?.data?.dob ? printAge(testData.data.dob) : undefined}
            />
            <InfoCell label="Gender" value={testData?.data?.gender} />
            <InfoCell label="Clinical Address" value={test?.clinical_address} />
            <InfoCell label="Clinical Diagnosis" value={test?.clinical_diagnosis} />
            <InfoCell label="Specimen" value={test?.specimen} />
            <InfoCell
              label="Date Received"
              value={test?.createdAt ? moment(test.createdAt).format("Do MMM, YYYY") : undefined}
            />
            <InfoCell
              label="Date Reported"
              value={
                test?.status === "Test Completed" && test?.updatedAt
                  ? moment(test.updatedAt).format("Do MMM, YYYY")
                  : "Pending"
              }
            />
            <InfoCell label="Lab No." value={reportNo} />
          </div>
        </div>

        <div className="px-8 pb-3 print:px-6 print:pb-2">
          <h2 className="text-center text-base font-bold uppercase tracking-wide border-b-2 border-slate-800 pb-2 print:pb-1 break-inside-avoid">
            {test?.test_title} Report
          </h2>
        </div>

        <div className="px-8 pb-6 print:px-6 print:pb-3 space-y-4 print:space-y-2">
          {numericItems.length > 0 && (
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white break-inside-avoid">
                  <th className="text-left px-3 py-2 print:py-1 font-semibold">Parameter</th>
                  <th className="text-left px-3 py-2 print:py-1 font-semibold">Value</th>
                  <th className="text-left px-3 py-2 print:py-1 font-semibold">Unit</th>
                  <th className="text-left px-3 py-2 print:py-1 font-semibold">Ref. Range</th>
                </tr>
              </thead>
              <tbody>
                {numericItems.map((item: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-slate-200 last:border-b-0 even:bg-slate-50 break-inside-avoid"
                  >
                    <td className="px-3 py-2 print:py-1 font-medium text-slate-700">
                      {item.parameter.name}
                    </td>
                    <td className="px-3 py-2 print:py-1 font-bold text-slate-900">
                      {item.parameter.value}
                    </td>
                    <td className="px-3 py-2 print:py-1 text-slate-500">
                      {item.parameter.selectedunit || item.parameter.unit?.[0] || "-"}
                    </td>
                    <td className="px-3 py-2 print:py-1 text-slate-500">{item.parameter.range || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {textItems.length > 0 && (
            <div className="space-y-2.5 print:space-y-1.5 text-sm text-slate-700 leading-relaxed print:leading-snug">
              {textItems.map((item: any, index: number) => {
                const name = (item.parameter.name || "").trim();
                const value = (item.parameter.value || "").trim();
                const isImpression = /^impression$/i.test(name);
                const isAdvice = /^advice$/i.test(name);

                if (isImpression) {
                  return (
                    <div
                      key={index}
                      className="border border-slate-300 rounded bg-slate-50 px-4 py-2.5 print:px-3 print:py-2 break-inside-avoid"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-800 mb-1">
                        Impression
                      </p>
                      <p className="font-semibold whitespace-pre-wrap">{value || "-"}</p>
                    </div>
                  );
                }
                if (isAdvice) {
                  return (
                    <p key={index} className="italic text-slate-600 whitespace-pre-wrap break-inside-avoid">
                      <span className="font-semibold not-italic">Advice: </span>
                      {value || "-"}
                    </p>
                  );
                }
                return (
                  <p key={index} className="whitespace-pre-wrap break-inside-avoid">
                    <span className="font-bold underline">{name}</span>
                    {value ? `: ${value}` : ""}
                  </p>
                );
              })}
            </div>
          )}

          {resultItems.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">
              No result data recorded for this test.
            </p>
          )}

          {test?.labRemark && (
            <div className="border border-slate-300 rounded bg-slate-50 px-4 py-2.5 print:px-3 print:py-2 break-inside-avoid">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-800 mb-1">
                Clinical Remark
              </p>
              <p className="text-sm whitespace-pre-wrap">{test.labRemark}</p>
            </div>
          )}
        </div>

        <div className="px-8 pb-6 print:px-6 print:pb-3 flex items-end justify-between gap-6 break-inside-avoid">
          <p className="text-[11px] text-slate-400 italic max-w-xs">
            Laboratory and clinical correlation is advised. This report was electronically
            generated and reflects results at the time of testing.
          </p>
          <div className="text-center flex-shrink-0">
            <div className="w-40 border-b border-slate-400 mb-1"></div>
            <p className="text-xs text-slate-500">Authorized Signatory</p>
          </div>
        </div>

        {hasContactFooter && (
          <div className="bg-brand-900 text-white text-[11px] px-8 py-2 print:px-6 print:py-1.5 flex flex-wrap items-center justify-between gap-2 break-inside-avoid">
            {branding?.address && (
              <span>
                <i className="fas fa-map-marker-alt mr-1"></i>
                {branding.address}
              </span>
            )}
            <span className="flex items-center gap-4">
              {branding?.phone && (
                <span>
                  <i className="fas fa-phone mr-1"></i>
                  {branding.phone}
                </span>
              )}
              {branding?.contactEmail && (
                <span>
                  <i className="fas fa-envelope mr-1"></i>
                  {branding.contactEmail}
                </span>
              )}
            </span>
          </div>
        )}
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
            size: A5 landscape;
            margin: 8mm;
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
