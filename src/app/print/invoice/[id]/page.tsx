"use client";

import { use } from "react";
import useSWR from "swr";
import moment from "moment";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/functions";
import Skeleton from "@/components/ui/Skeleton";

const STATUS_BADGE: Record<string, string> = {
  Unpaid: "bg-red-50 text-red-700",
  Paid: "bg-emerald-50 text-emerald-700",
  Void: "bg-slate-100 text-slate-500",
};

export default function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, isLoading, error }: any = useSWR(`/api/invoices?id=${id}`, fetcher);
  const { data: brandingData }: any = useSWR("/api/organization/branding", fetcher);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto mt-16 space-y-3 px-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="mx-auto mt-16 text-center text-sm text-red-600">
        Failed to load this invoice.
      </div>
    );
  }

  const invoice = data.data;
  const branding = brandingData?.data;
  const test = invoice.test;
  const patient = invoice.patient;
  const payment = test?.payment;
  const balance = invoice.amount - invoice.amountPaid;

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
              Invoice
            </h2>
            <p className="text-sm font-mono text-slate-500 mt-1">{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="px-8 py-4 print:px-6 print:py-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Billed To
            </p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {patient?.firstname} {patient?.lastname}
            </p>
            {patient?.phone && <p className="text-xs text-slate-500">{patient.phone}</p>}
            {patient?.address && (
              <p className="text-xs text-slate-500">
                {patient.address}
                {patient.city ? `, ${patient.city}` : ""}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Date Issued
            </p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {moment(invoice.createdAt).format("Do MMM, YYYY")}
            </p>
            <span
              className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                STATUS_BADGE[invoice.status] || "bg-slate-100 text-slate-600"
              }`}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="px-8 pb-4 print:px-6 print:pb-2">
          <table className="w-full text-sm border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="text-left px-3 py-2 font-semibold">Description</th>
                <th className="text-right px-3 py-2 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="px-3 py-3">
                  <p className="font-medium text-slate-700">{test?.test_title || "Test"}</p>
                  {test?.specimen && (
                    <p className="text-xs text-slate-400">Specimen: {test.specimen}</p>
                  )}
                </td>
                <td className="px-3 py-3 text-right font-semibold text-slate-800">
                  {formatCurrency(invoice.amount)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <div className="w-full max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(invoice.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(invoice.amountPaid)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="font-semibold text-slate-700">Balance Due</span>
                <span className="font-bold text-slate-900">{formatCurrency(balance)}</span>
              </div>
            </div>
          </div>

          {invoice.status === "Void" && invoice.voidedReason && (
            <p className="text-xs text-slate-400 italic mt-4">
              Voided: {invoice.voidedReason}
            </p>
          )}

          {payment && (
            <div className="mt-6 border border-slate-200 rounded-lg px-4 py-3 text-xs text-slate-500 grid grid-cols-2 gap-2">
              <span>
                <i className="fas fa-money-bill-wave mr-1.5"></i>
                Paid via {payment.payment_option?.toUpperCase()}
              </span>
              <span>
                <i className="fas fa-calendar mr-1.5"></i>
                {moment(payment.createdAt).format("Do MMM, YYYY | h:mm a")}
              </span>
              <span className="col-span-2">
                <i className="fas fa-user-nurse mr-1.5"></i>
                Received by {payment.user?.firstname} {payment.user?.lastname}
              </span>
            </div>
          )}
        </div>

        {(branding?.phone || branding?.contactEmail) && (
          <div className="bg-brand-900 text-white text-[11px] px-8 py-2 print:px-6 print:py-1.5 flex flex-wrap items-center gap-4">
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
