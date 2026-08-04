"use client";

import { useState } from "react";
import useSWR from "swr";
import moment from "moment";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/functions";
import { toast } from "@/components/ui/Toast";
import { confirmDialog } from "@/components/ui/ConfirmDialog";
import Pagination from "@/components/ui/Pagination";
import ActionMenu from "@/components/ui/ActionMenu";
import TableSkeleton from "@/components/PatientsData/TableSkeleton";
import {
  TABLE_CARD_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_TH_CLASS,
  TABLE_TR_CLASS,
  TABLE_TD_CLASS,
} from "@/components/ui/table";

const STATUS_BADGE: Record<string, string> = {
  Unpaid: "bg-red-50 text-red-700",
  Paid: "bg-emerald-50 text-emerald-700",
  Void: "bg-slate-100 text-slate-500",
};

const STATUS_FILTERS = ["All", "Unpaid", "Paid", "Void"];

export default function InvoicesData() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const resPerPage = 10;

  const { data, isLoading, mutate }: any = useSWR(
    `/api/invoices?status=${statusFilter}`,
    fetcher
  );

  const invoices: any[] = data?.data ?? [];
  const filtered = search.trim()
    ? invoices.filter((inv) => {
        const q = search.trim().toLowerCase();
        const patientName = `${inv.patient?.firstname ?? ""} ${inv.patient?.lastname ?? ""}`.toLowerCase();
        return (
          inv.invoiceNumber.toLowerCase().includes(q) ||
          patientName.includes(q) ||
          (inv.test?.test_title || "").toLowerCase().includes(q)
        );
      })
    : invoices;

  const startIndex = (page - 1) * resPerPage;
  const pageInvoices = filtered.slice(startIndex, startIndex + resPerPage);

  const totals = invoices.reduce(
    (acc, inv) => {
      acc.totalBilled += inv.amount;
      if (inv.status === "Paid") acc.totalPaid += inv.amountPaid;
      if (inv.status === "Unpaid") acc.totalOutstanding += inv.amount;
      return acc;
    },
    { totalBilled: 0, totalPaid: 0, totalOutstanding: 0 }
  );

  const handleVoid = async (invoice: any) => {
    const confirmed = await confirmDialog({
      title: "Void invoice",
      message: `Void ${invoice.invoiceNumber}? This marks it as no longer payable - use this to correct a mistake, not to erase a completed sale.`,
      confirmLabel: "Void Invoice",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!confirmed || voidingId) return;

    setVoidingId(invoice._id);
    try {
      const res = await fetch("/api/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invoice._id, reason: "Voided from Invoices page" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`${invoice.invoiceNumber} voided`);
        mutate();
      } else {
        toast.error(json.error || "Failed to void invoice");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setVoidingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total Billed
          </p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {formatCurrency(totals.totalBilled)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total Collected
          </p>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {formatCurrency(totals.totalPaid)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Outstanding
          </p>
          <p className="text-xl font-bold text-red-600 mt-1">
            {formatCurrency(totals.totalOutstanding)}
          </p>
        </div>
      </div>

      <div className={TABLE_CARD_CLASS}>
        <div className={`${TABLE_HEADER_CLASS} flex flex-wrap items-center gap-3`}>
          <div className="flex-grow">
            <h6 className="text-slate-800 text-md md:text-lg font-semibold">
              Invoices ({filtered.length})
            </h6>
            <span className="font-normal text-xs md:text-sm text-slate-400">
              Every test generates its own invoice automatically when ordered
            </span>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search invoice #, patient, test..."
            className="border border-slate-300 rounded-lg text-sm px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="inline-flex items-center bg-slate-100 rounded-lg p-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === s
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton columns={6} />
        ) : filtered.length > 0 ? (
          <>
            <div className="block w-full overflow-x-auto">
              <table className="items-center w-full bg-transparent border-collapse">
                <thead>
                  <tr>
                    <th className={TABLE_TH_CLASS}>Invoice #</th>
                    <th className={TABLE_TH_CLASS}>Patient</th>
                    <th className={TABLE_TH_CLASS}>Test</th>
                    <th className={TABLE_TH_CLASS}>Amount</th>
                    <th className={TABLE_TH_CLASS}>Status</th>
                    <th className={TABLE_TH_CLASS}>Date</th>
                    <th className="px-6 align-middle border-b py-3 text-xs uppercase whitespace-nowrap font-semibold text-right tracking-wide bg-slate-50 text-slate-500 border-slate-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageInvoices.map((invoice: any) => (
                    <tr key={invoice._id} className={TABLE_TR_CLASS}>
                      <th className="px-6 align-middle text-sm p-3 text-left font-mono text-slate-700">
                        {invoice.invoiceNumber}
                      </th>
                      <td className={TABLE_TD_CLASS}>
                        {invoice.patient?.firstname} {invoice.patient?.lastname}
                      </td>
                      <td className={TABLE_TD_CLASS}>{invoice.test?.test_title}</td>
                      <td className={TABLE_TD_CLASS + " font-semibold"}>
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className={TABLE_TD_CLASS}>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            STATUS_BADGE[invoice.status] || "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className={TABLE_TD_CLASS}>
                        {moment(invoice.createdAt).format("Do MMM, YYYY")}
                      </td>
                      <td className="px-6 align-middle text-sm p-3 text-right whitespace-nowrap">
                        <ActionMenu
                          items={[
                            {
                              label: "Print",
                              icon: "fa-print",
                              onClick: () =>
                                window.open(`/print/invoice/${invoice._id}`, "_blank"),
                            },
                            ...(invoice.status === "Unpaid"
                              ? [
                                  {
                                    label: "Void Invoice",
                                    icon: "fa-ban",
                                    danger: true,
                                    disabled: voidingId === invoice._id,
                                    onClick: () => handleVoid(invoice),
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center my-5 px-2">
              <Pagination
                activePage={page}
                itemsCountPerPage={resPerPage}
                totalItemsCount={filtered.length}
                onChange={setPage}
              />
            </div>
          </>
        ) : (
          <div className="my-8">
            <p className="text-center text-sm text-slate-500">No invoices match this view.</p>
          </div>
        )}
      </div>
    </div>
  );
}
