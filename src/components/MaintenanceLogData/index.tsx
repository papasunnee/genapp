"use client";

import { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import moment from "moment";
import { fetcher } from "@/utils/fetcher";
import { toast } from "@/components/ui/Toast";
import { confirmDialog } from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import ActionMenu from "@/components/ui/ActionMenu";
import Pagination from "@/components/ui/Pagination";
import TableSkeleton from "@/components/PatientsData/TableSkeleton";
import {
  TABLE_CARD_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_TH_CLASS,
  TABLE_TR_CLASS,
  TABLE_TD_CLASS,
} from "@/components/ui/table";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";
const LABEL_CLASS = "block text-sm font-medium text-slate-700 mb-1";

const TYPE_BADGE: Record<string, string> = {
  Calibration: "bg-blue-50 text-blue-700",
  Maintenance: "bg-emerald-50 text-emerald-700",
  Repair: "bg-amber-50 text-amber-700",
};

function NewEntryForm({ onCreated }: { onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"Calibration" | "Maintenance" | "Repair">("Calibration");
  const analyzerRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const performedAtRef = useRef<HTMLInputElement>(null);
  const nextDueDateRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/maintenance-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analyzer: analyzerRef.current?.value,
          type,
          description: descriptionRef.current?.value,
          performedAt: performedAtRef.current?.value,
          nextDueDate: nextDueDateRef.current?.value || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Maintenance entry logged");
        onCreated();
      } else {
        toast.error(data.error || "Failed to log entry");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="ml-analyzer">
            Analyzer / Instrument
          </label>
          <input
            id="ml-analyzer"
            type="text"
            required
            maxLength={100}
            ref={analyzerRef}
            placeholder="e.g. Mindray BS-240"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Type</label>
          <div className="inline-flex items-center bg-slate-100 rounded-lg p-1 w-full">
            {(["Calibration", "Maintenance", "Repair"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 text-xs font-semibold px-2 py-1.5 rounded-md transition-colors ${
                  type === t ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="ml-date">
            Date Performed
          </label>
          <input
            id="ml-date"
            type="date"
            required
            max={new Date().toISOString().split("T")[0]}
            defaultValue={new Date().toISOString().split("T")[0]}
            ref={performedAtRef}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="ml-next-due">
            Next Due <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input id="ml-next-due" type="date" ref={nextDueDateRef} className={INPUT_CLASS} />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="ml-description">
          Description
        </label>
        <textarea
          id="ml-description"
          ref={descriptionRef}
          required
          rows={3}
          maxLength={500}
          placeholder="What was done?"
          className={INPUT_CLASS}
        ></textarea>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <button
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 transition-colors"
        >
          <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-check"} mr-2`}></i>
          {loading ? "Saving..." : "Log Entry"}
        </button>
      </div>
    </form>
  );
}

export default function MaintenanceLogData() {
  const [typeFilter, setTypeFilter] = useState("All");
  const [analyzerFilter, setAnalyzerFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const resPerPage = 10;

  const { data, isLoading, mutate }: any = useSWR(
    `/api/maintenance-logs?type=${typeFilter}`,
    fetcher
  );

  const logs: any[] = data?.data ?? [];
  const analyzers = useMemo(
    () => Array.from(new Set(logs.map((l) => l.analyzer))).sort(),
    [logs]
  );
  const filtered =
    analyzerFilter === "All" ? logs : logs.filter((l) => l.analyzer === analyzerFilter);

  const startIndex = (page - 1) * resPerPage;
  const pageLogs = filtered.slice(startIndex, startIndex + resPerPage);

  const handleDelete = async (log: any) => {
    const confirmed = await confirmDialog({
      title: "Delete maintenance entry",
      message: `Delete the ${log.type} entry for ${log.analyzer}? This can't be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!confirmed || deletingId) return;

    setDeletingId(log._id);
    try {
      const res = await fetch("/api/maintenance-logs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: log._id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Entry deleted");
        mutate();
      } else {
        toast.error(json.error || "Failed to delete entry");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className={TABLE_CARD_CLASS}>
        <div className={`${TABLE_HEADER_CLASS} flex flex-wrap items-center gap-3`}>
          <div className="flex-grow">
            <h6 className="text-slate-800 text-md md:text-lg font-semibold">
              Maintenance Log ({filtered.length})
            </h6>
            <span className="font-normal text-xs md:text-sm text-slate-400">
              Calibration, maintenance, and repair history per analyzer
            </span>
          </div>
          <select
            value={analyzerFilter}
            onChange={(e) => {
              setAnalyzerFilter(e.target.value);
              setPage(1);
            }}
            className="border border-slate-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Analyzers</option>
            {analyzers.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <div className="inline-flex items-center bg-slate-100 rounded-lg p-1">
            {["All", "Calibration", "Maintenance", "Repair"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setPage(1);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                  typeFilter === t
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold uppercase px-4 py-2.5 rounded-lg transition-colors"
          >
            <i className="fas fa-plus"></i>
            New Entry
          </button>
        </div>

        {isLoading ? (
          <TableSkeleton columns={6} />
        ) : filtered.length > 0 ? (
          <>
            <div className="block w-full overflow-x-auto">
              <table className="items-center w-full bg-transparent border-collapse">
                <thead>
                  <tr>
                    <th className={TABLE_TH_CLASS}>Date</th>
                    <th className={TABLE_TH_CLASS}>Analyzer</th>
                    <th className={TABLE_TH_CLASS}>Type</th>
                    <th className={TABLE_TH_CLASS}>Description</th>
                    <th className={TABLE_TH_CLASS}>Next Due</th>
                    <th className={TABLE_TH_CLASS}>Performed By</th>
                    <th className="px-6 align-middle border-b py-3 text-xs uppercase whitespace-nowrap font-semibold text-right tracking-wide bg-slate-50 text-slate-500 border-slate-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageLogs.map((log: any) => (
                    <tr key={log._id} className={TABLE_TR_CLASS}>
                      <td className={TABLE_TD_CLASS}>
                        {moment(log.performedAt).format("Do MMM, YYYY")}
                      </td>
                      <td className={TABLE_TD_CLASS + " font-medium"}>{log.analyzer}</td>
                      <td className={TABLE_TD_CLASS}>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            TYPE_BADGE[log.type] || "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td className={TABLE_TD_CLASS + " max-w-xs truncate"}>{log.description}</td>
                      <td className={TABLE_TD_CLASS}>
                        {log.nextDueDate ? moment(log.nextDueDate).format("Do MMM, YYYY") : "-"}
                      </td>
                      <td className={TABLE_TD_CLASS}>{log.performedByLabel}</td>
                      <td className="px-6 align-middle text-sm p-3 text-right whitespace-nowrap">
                        <ActionMenu
                          items={[
                            {
                              label: "Delete",
                              icon: "fa-trash-alt",
                              danger: true,
                              disabled: deletingId === log._id,
                              onClick: () => handleDelete(log),
                            },
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
            <p className="text-center text-sm text-slate-500">
              No maintenance entries logged yet.
            </p>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title="New Maintenance Entry" onClose={() => setModalOpen(false)}>
        <NewEntryForm
          onCreated={() => {
            setModalOpen(false);
            mutate();
          }}
        />
      </Modal>
    </div>
  );
}
