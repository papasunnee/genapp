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

const STATUS_BADGE: Record<string, string> = {
  Pass: "bg-emerald-50 text-emerald-700",
  Fail: "bg-red-50 text-red-700",
};

function NewEntryForm({ onCreated }: { onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"Pass" | "Fail">("Pass");
  const analyzerRef = useRef<HTMLInputElement>(null);
  const testNameRef = useRef<HTMLInputElement>(null);
  const controlLevelRef = useRef<HTMLInputElement>(null);
  const expectedRangeRef = useRef<HTMLInputElement>(null);
  const observedValueRef = useRef<HTMLInputElement>(null);
  const correctiveActionRef = useRef<HTMLTextAreaElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const performedAtRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/qc-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analyzer: analyzerRef.current?.value,
          testName: testNameRef.current?.value,
          controlLevel: controlLevelRef.current?.value,
          expectedRange: expectedRangeRef.current?.value,
          observedValue: observedValueRef.current?.value,
          status,
          correctiveAction: correctiveActionRef.current?.value,
          notes: notesRef.current?.value,
          performedAt: performedAtRef.current?.value,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("QC entry logged");
        onCreated();
      } else {
        toast.error(data.error || "Failed to log QC entry");
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
          <label className={LABEL_CLASS} htmlFor="qc-analyzer">
            Analyzer / Instrument
          </label>
          <input
            id="qc-analyzer"
            type="text"
            required
            maxLength={100}
            ref={analyzerRef}
            placeholder="e.g. Mindray BS-240"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="qc-test">
            Test / Parameter
          </label>
          <input
            id="qc-test"
            type="text"
            required
            maxLength={100}
            ref={testNameRef}
            placeholder="e.g. Glucose"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="qc-level">
            Control Level
          </label>
          <input
            id="qc-level"
            type="text"
            required
            maxLength={60}
            ref={controlLevelRef}
            placeholder="e.g. Level 1"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="qc-range">
            Expected Range{" "}
            <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="qc-range"
            type="text"
            maxLength={100}
            ref={expectedRangeRef}
            placeholder="e.g. 70-110 mg/dL"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="qc-value">
            Observed Value
          </label>
          <input
            id="qc-value"
            type="text"
            required
            maxLength={60}
            ref={observedValueRef}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="qc-date">
            Date Performed
          </label>
          <input
            id="qc-date"
            type="date"
            required
            max={new Date().toISOString().split("T")[0]}
            defaultValue={new Date().toISOString().split("T")[0]}
            ref={performedAtRef}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Result</label>
        <div className="inline-flex items-center bg-slate-100 rounded-lg p-1">
          {(["Pass", "Fail"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-md transition-colors ${
                status === s
                  ? s === "Pass"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "bg-white text-red-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {status === "Fail" && (
        <div>
          <label className={LABEL_CLASS} htmlFor="qc-corrective">
            Corrective Action
          </label>
          <textarea
            id="qc-corrective"
            ref={correctiveActionRef}
            rows={2}
            maxLength={500}
            placeholder="What was done in response to this out-of-range result?"
            className={INPUT_CLASS}
          ></textarea>
        </div>
      )}

      <div>
        <label className={LABEL_CLASS} htmlFor="qc-notes">
          Notes <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="qc-notes"
          ref={notesRef}
          rows={2}
          maxLength={500}
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

export default function QCLogsData() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [analyzerFilter, setAnalyzerFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const resPerPage = 10;

  const { data, isLoading, mutate }: any = useSWR(
    `/api/qc-logs?status=${statusFilter}`,
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
  const failCount = logs.filter((l) => l.status === "Fail").length;

  const handleDelete = async (log: any) => {
    const confirmed = await confirmDialog({
      title: "Delete QC entry",
      message: `Delete the ${log.status} entry for ${log.testName} on ${log.analyzer}? This can't be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!confirmed || deletingId) return;

    setDeletingId(log._id);
    try {
      const res = await fetch("/api/qc-logs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: log._id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("QC entry deleted");
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total Entries
          </p>
          <p className="text-xl font-bold text-slate-800 mt-1">{logs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Failed Controls
          </p>
          <p className="text-xl font-bold text-red-600 mt-1">{failCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Analyzers Tracked
          </p>
          <p className="text-xl font-bold text-slate-800 mt-1">{analyzers.length}</p>
        </div>
      </div>

      <div className={TABLE_CARD_CLASS}>
        <div className={`${TABLE_HEADER_CLASS} flex flex-wrap items-center gap-3`}>
          <div className="flex-grow">
            <h6 className="text-slate-800 text-md md:text-lg font-semibold">
              QC Log ({filtered.length})
            </h6>
            <span className="font-normal text-xs md:text-sm text-slate-400">
              Daily quality-control checks per analyzer
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
            {["All", "Pass", "Fail"].map((s) => (
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
          <TableSkeleton columns={7} />
        ) : filtered.length > 0 ? (
          <>
            <div className="block w-full overflow-x-auto">
              <table className="items-center w-full bg-transparent border-collapse">
                <thead>
                  <tr>
                    <th className={TABLE_TH_CLASS}>Date</th>
                    <th className={TABLE_TH_CLASS}>Analyzer</th>
                    <th className={TABLE_TH_CLASS}>Test</th>
                    <th className={TABLE_TH_CLASS}>Level</th>
                    <th className={TABLE_TH_CLASS}>Observed</th>
                    <th className={TABLE_TH_CLASS}>Status</th>
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
                      <td className={TABLE_TD_CLASS}>{log.testName}</td>
                      <td className={TABLE_TD_CLASS}>{log.controlLevel}</td>
                      <td className={TABLE_TD_CLASS}>
                        {log.observedValue}
                        {log.expectedRange && (
                          <span className="text-slate-400"> / {log.expectedRange}</span>
                        )}
                      </td>
                      <td className={TABLE_TD_CLASS}>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            STATUS_BADGE[log.status] || "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {log.status}
                        </span>
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
              No QC entries logged yet.
            </p>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title="New QC Log Entry" onClose={() => setModalOpen(false)}>
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
