"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import moment from "moment";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency, printAge, displayTestResult } from "@/utils/functions";
import { toast } from "@/components/ui/Toast";
import Skeleton from "@/components/ui/Skeleton";
import { TABLE_CARD_CLASS, TABLE_HEADER_CLASS } from "@/components/ui/table";

const STATUS_BADGE: Record<string, string> = {
  "Awaiting Payment": "bg-red-50 text-red-700",
  "Awaiting Result": "bg-orange-50 text-orange-700",
  "Test Completed": "bg-emerald-50 text-emerald-700",
};

const LABEL_CLASS = "block text-sm font-medium text-slate-700 mb-1";
const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";

export default function ResultDetail({ id }: { id: string }) {
  const { data, isLoading, mutate }: any = useSWR(`/api/diagnosis?id=${id}`, fetcher);
  const test = data?.data;

  const [resultForm, setResultForm] = useState<Record<string, string>>({});
  const [unitForm, setUnitForm] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const parsedTestData: any[] = useMemo(() => {
    try {
      return test?.test_data ? JSON.parse(test.test_data) : [];
    } catch {
      return [];
    }
  }, [test?.test_data]);

  useEffect(() => {
    if (test?.status === "Awaiting Result" || editing) {
      const seededValue: Record<string, string> = {};
      const seededUnit: Record<string, string> = {};
      parsedTestData.forEach((item: any) => {
        seededValue[item.parameter.id] = item.parameter.value || "";
        seededUnit[item.parameter.id] =
          item.parameter.selectedunit || item.parameter.unit?.[0] || "";
      });
      setResultForm(seededValue);
      setUnitForm(seededUnit);
    }
  }, [test?._id, test?.status, editing, parsedTestData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResultForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = parsedTestData.map((item: any) => ({
        ...item,
        parameter: {
          ...item.parameter,
          value: resultForm[item.parameter.id] ?? item.parameter.value,
          selectedunit: unitForm[item.parameter.id] ?? item.parameter.selectedunit,
        },
      }));
      const res = await fetch("/api/diagnosis", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ put_id: test._id, test_data: JSON.stringify(updated) }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Result saved");
        setEditing(false);
        mutate();
      } else {
        toast.error(json.error || "Failed to save result");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className={TABLE_CARD_CLASS}>
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className={TABLE_CARD_CLASS}>
        <div className="p-6 text-center text-sm text-slate-500">Result not found.</div>
      </div>
    );
  }

  const badgeClass = STATUS_BADGE[test.status] || "bg-slate-100 text-slate-600";
  const showForm = test.status === "Awaiting Result" || (test.status === "Test Completed" && editing);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/results"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors"
      >
        <i className="fas fa-arrow-left text-xs"></i>
        Back to Results
      </Link>

      <div className={TABLE_CARD_CLASS}>
        <div className={`${TABLE_HEADER_CLASS} flex flex-wrap items-start justify-between gap-4`}>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-slate-800">{test.test_title}</h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
                {test.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Ordered {moment(test.createdAt).format("Do MMM, YYYY | h:mm a")}
              {test.user && (
                <>
                  {" "}
                  &middot; by {test.user.firstname} {test.user.lastname}
                </>
              )}
            </p>
          </div>
          {test.status === "Test Completed" && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditing((e) => !e)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 transition-colors"
              >
                <i className={`fas ${editing ? "fa-times" : "fa-pen"}`}></i>
                {editing ? "Cancel Edit" : "Edit Result"}
              </button>
              <Link
                href={`/print/${test.patient?._id}/${test._id}`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 transition-colors"
              >
                <i className="fas fa-print"></i>
                Print Report
              </Link>
            </div>
          )}
        </div>

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Patient</p>
            <Link
              href={`/admin/patients/${test.patient?._id}`}
              className="font-semibold text-brand-700 hover:underline"
            >
              {test.patient?.firstname} {test.patient?.lastname}
            </Link>
            <p className="text-xs text-slate-400">
              {test.patient?.gender}
              {test.patient?.dob && ` · ${printAge(test.patient.dob)}`}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Specimen</p>
            <p className="font-semibold text-slate-800">{test.specimen || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Clinical Diagnosis
            </p>
            <p className="font-semibold text-slate-800">{test.clinical_diagnosis || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Cost</p>
            <p className="font-semibold text-slate-800">{formatCurrency(test.total_cost)}</p>
          </div>
        </div>
      </div>

      <div className={TABLE_CARD_CLASS}>
        <div className={`${TABLE_HEADER_CLASS} flex flex-wrap items-center justify-between gap-3`}>
          <h3 className="text-base font-semibold text-slate-800">Payment</h3>
          {test.invoice?._id && (
            <Link
              href={`/print/invoice/${test.invoice._id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
            >
              <i className="fas fa-print"></i>
              Print Invoice
            </Link>
          )}
        </div>
        <div className="px-6 py-5">
          {test.payment ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Invoice No.
                </p>
                <p className="font-semibold text-slate-800">{test.invoice?.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Amount Paid
                </p>
                <p className="font-semibold text-emerald-700">
                  {formatCurrency(test.payment.amount_paid)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Date Paid
                </p>
                <p className="font-semibold text-slate-800">
                  {moment(test.payment.createdAt).format("Do MMM, YYYY")}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Received By
                </p>
                <p className="font-semibold text-slate-800">
                  {test.payment.user?.firstname} {test.payment.user?.lastname}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-slate-500">
                Payment hasn&apos;t been recorded for this test yet.
              </p>
              <Link
                href={`/admin/payments/${test._id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 transition-colors"
              >
                <i className="fas fa-money-bill-wave"></i>
                Record Payment
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className={TABLE_CARD_CLASS}>
        <div className={TABLE_HEADER_CLASS}>
          <h3 className="text-base font-semibold text-slate-800">Result</h3>
        </div>
        <div className="px-6 py-5">
          {test.status === "Awaiting Payment" && (
            <div className="text-center py-8">
              <i className="fas fa-lock text-2xl text-slate-300 mb-3"></i>
              <p className="text-sm text-slate-500">
                Results can be entered once payment has been recorded for this test.
              </p>
            </div>
          )}

          {showForm && (
            <div className="space-y-4">
              {parsedTestData.map((item: any, i: number) => {
                const { parameter } = item;
                if (parameter.resultType === "text") {
                  return (
                    <div key={i}>
                      <label className={LABEL_CLASS}>{parameter.name}</label>
                      <textarea
                        name={parameter.id}
                        value={resultForm[parameter.id] || ""}
                        onChange={handleChange}
                        rows={3}
                        className={INPUT_CLASS}
                      />
                    </div>
                  );
                }
                const hasUnit = parameter.unit?.length > 0;
                return (
                  <div
                    key={i}
                    className={`rounded-lg border border-slate-200 p-4 grid gap-4 ${
                      hasUnit ? "grid-cols-2" : "grid-cols-1"
                    }`}
                  >
                    <div>
                      <label className={LABEL_CLASS}>{parameter.name}</label>
                      <input
                        type="number"
                        name={parameter.id}
                        value={resultForm[parameter.id] || ""}
                        onChange={handleChange}
                        className={INPUT_CLASS}
                      />
                      {parameter.range && (
                        <p className="text-xs text-slate-500 mt-1">
                          Reference range: {parameter.range}
                        </p>
                      )}
                    </div>
                    {hasUnit && (
                      <div>
                        <label className={LABEL_CLASS}>Unit</label>
                        <select
                          value={unitForm[parameter.id] || parameter.unit[0]}
                          onChange={(e) =>
                            setUnitForm((prev) => ({ ...prev, [parameter.id]: e.target.value }))
                          }
                          className={INPUT_CLASS}
                        >
                          {parameter.unit.map((u: string, idx: number) => (
                            <option key={idx} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex justify-end gap-3 pt-2">
                {editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2.5 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
                >
                  {saving && <i className="fas fa-spinner fa-spin"></i>}
                  {saving ? "Saving..." : "Save Result"}
                </button>
              </div>
            </div>
          )}

          {test.status === "Test Completed" &&
            !editing &&
            displayTestResult({ ...test, test_data: parsedTestData }, { data: test.patient })}
        </div>
      </div>
    </div>
  );
}
