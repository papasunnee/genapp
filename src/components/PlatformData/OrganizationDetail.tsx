"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import moment from "moment";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/functions";
import { toast } from "@/components/ui/Toast";
import { confirmDialog } from "@/components/ui/ConfirmDialog";
import Skeleton from "@/components/ui/Skeleton";
import { TABLE_CARD_CLASS, TABLE_HEADER_CLASS } from "@/components/ui/table";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";
const LABEL_CLASS = "block text-sm font-medium text-slate-700 mb-1";

const PLANS = ["Free", "Pro", "Enterprise"];
const SUBSCRIPTION_STATUSES = ["Trial", "Active", "Expired", "Cancelled"];

const PLAN_BADGE: Record<string, string> = {
  Free: "bg-slate-100 text-slate-600",
  Pro: "bg-brand-50 text-brand-700",
  Enterprise: "bg-violet-50 text-violet-700",
};

const SUBSCRIPTION_BADGE: Record<string, string> = {
  Trial: "bg-amber-50 text-amber-700",
  Active: "bg-emerald-50 text-emerald-700",
  Expired: "bg-red-50 text-red-700",
  Cancelled: "bg-slate-100 text-slate-500",
};

function StatBlock({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-slate-800 leading-none truncate">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function OrganizationDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, mutate }: any = useSWR(`/api/organizations/${id}`, fetcher);
  const { data: historyData, mutate: mutateHistory }: any = useSWR(
    `/api/organizations/${id}/subscription-history`,
    fetcher
  );
  const { data: activityData }: any = useSWR(`/api/organizations/${id}/activity-log`, fetcher);

  const organization = data?.data?.organization;
  const stats = data?.data?.stats;
  const history = historyData?.data ?? [];
  const activityLog = activityData?.data ?? [];

  const [form, setForm] = useState({ plan: "", subscriptionStatus: "", renewsAt: "", amount: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const openForm = () => {
    setForm({
      plan: organization?.plan || "Free",
      subscriptionStatus: organization?.subscriptionStatus || "Trial",
      renewsAt: organization?.subscriptionRenewsAt
        ? String(organization.subscriptionRenewsAt).slice(0, 10)
        : "",
      amount: "",
      note: "",
    });
    setFormOpen(true);
  };

  const handleSaveSubscription = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          plan: form.plan,
          subscriptionStatus: form.subscriptionStatus,
          subscriptionRenewsAt: form.renewsAt || null,
          amount: form.amount,
          note: form.note,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Subscription updated");
        setFormOpen(false);
        mutate();
        mutateHistory();
      } else {
        toast.error(json.error || "Failed to update subscription");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setSaving(false);
  };

  const handleToggleStatus = async () => {
    const nextStatus = organization.status === "Active" ? "Suspended" : "Active";
    if (nextStatus === "Suspended") {
      const confirmed = await confirmDialog({
        title: "Suspend organization",
        message: `Suspend "${organization.name}"? Their staff will not be able to sign in until reactivated.`,
        confirmLabel: "Suspend",
        cancelLabel: "Cancel",
        danger: true,
      });
      if (!confirmed) return;
    }
    try {
      const res = await fetch("/api/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Organization ${nextStatus === "Active" ? "activated" : "suspended"}`);
        mutate();
      } else {
        toast.error(json.error || "Failed to update organization");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirmDialog({
      title: "Delete organization",
      message: `This permanently deletes "${organization.name}" and every patient, test, payment, and staff record in it. This cannot be undone.`,
      confirmLabel: "Delete permanently",
      cancelLabel: "Cancel",
      danger: true,
      confirmText: organization.subdomain,
    });
    if (!confirmed) return;

    try {
      const res = await fetch("/api/organizations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, confirmSubdomain: organization.subdomain }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`"${organization.name}" deleted`);
        router.push("/platform");
      } else {
        toast.error(json.error || "Failed to delete organization");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className={TABLE_CARD_CLASS}>
        <div className="p-6 text-center text-sm text-slate-500">Organization not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/platform"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors"
      >
        <i className="fas fa-arrow-left text-xs"></i>
        Back to Organizations
      </Link>

      <div className={TABLE_CARD_CLASS}>
        <div className={`${TABLE_HEADER_CLASS} flex flex-wrap items-start justify-between gap-4`}>
          <div className="flex items-center gap-4">
            {organization.logo ? (
              <img
                src={organization.logo}
                alt={organization.name}
                className="h-14 w-14 rounded-lg object-contain border border-slate-200 bg-white"
              />
            ) : (
              <div className="h-14 w-14 rounded-lg bg-brand-700 text-white flex items-center justify-center flex-shrink-0">
                <i className="fas fa-flask text-xl"></i>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{organization.name}</h2>
              <p className="text-sm text-slate-400">
                {organization.subdomain}.{data?.data?.rootDomain || "localhost"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Created {moment(organization.createdAt).format("Do MMM, YYYY")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                organization.status === "Active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {organization.status}
            </span>
            <button
              type="button"
              onClick={handleToggleStatus}
              className={`inline-flex items-center gap-2 rounded-lg border text-sm font-semibold px-4 py-2 transition-colors ${
                organization.status === "Active"
                  ? "border-red-200 text-red-600 hover:bg-red-50"
                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              {organization.status === "Active" ? "Suspend" : "Activate"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-700 hover:border-red-200 text-sm font-semibold px-4 py-2 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBlock label="Staff" value={stats?.staffCount ?? 0} icon="fa-users" />
          <StatBlock label="Patients" value={stats?.patientCount ?? 0} icon="fa-user" />
          <StatBlock label="Tests Ordered" value={stats?.testCount ?? 0} icon="fa-flask" />
          <StatBlock label="Revenue" value={formatCurrency(stats?.revenue ?? 0)} icon="fa-money-bill-wave" />
        </div>

        {(organization.tagline || organization.address || organization.phone || organization.contactEmail) && (
          <div className="px-6 pb-5 pt-1 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            {organization.tagline && <p className="italic">&ldquo;{organization.tagline}&rdquo;</p>}
            {organization.address && (
              <p>
                <i className="fas fa-map-marker-alt mr-1.5 text-slate-400"></i>
                {organization.address}
              </p>
            )}
            <p className="space-x-4">
              {organization.phone && (
                <span>
                  <i className="fas fa-phone mr-1.5 text-slate-400"></i>
                  {organization.phone}
                </span>
              )}
              {organization.contactEmail && (
                <span>
                  <i className="fas fa-envelope mr-1.5 text-slate-400"></i>
                  {organization.contactEmail}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className={TABLE_CARD_CLASS}>
        <div className={`${TABLE_HEADER_CLASS} flex flex-wrap items-center justify-between gap-3`}>
          <h3 className="text-base font-semibold text-slate-800">Subscription</h3>
          {!formOpen && (
            <button
              type="button"
              onClick={openForm}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 transition-colors"
            >
              <i className="fas fa-pen"></i>
              Record Change
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Plan</p>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ${
                  PLAN_BADGE[organization.plan] || "bg-slate-100 text-slate-600"
                }`}
              >
                {organization.plan}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ${
                  SUBSCRIPTION_BADGE[organization.subscriptionStatus] || "bg-slate-100 text-slate-600"
                }`}
              >
                {organization.subscriptionStatus}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Renews</p>
              <p className="text-sm font-semibold text-slate-700">
                {organization.subscriptionRenewsAt
                  ? moment(organization.subscriptionRenewsAt).format("Do MMM, YYYY")
                  : "N/A"}
              </p>
            </div>
          </div>

          {formOpen && (
            <div className="mt-4 border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Plan</label>
                  <select
                    value={form.plan}
                    onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
                    className={INPUT_CLASS}
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Subscription Status</label>
                  <select
                    value={form.subscriptionStatus}
                    onChange={(e) => setForm((f) => ({ ...f, subscriptionStatus: e.target.value }))}
                    className={INPUT_CLASS}
                  >
                    {SUBSCRIPTION_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Renews On</label>
                  <input
                    type="date"
                    value={form.renewsAt}
                    onChange={(e) => setForm((f) => ({ ...f, renewsAt: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Amount Recorded (NGN)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Note</label>
                  <input
                    value={form.note}
                    onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                    placeholder="e.g. Annual renewal via bank transfer"
                    maxLength={300}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-sm font-semibold px-4 py-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveSubscription}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white text-sm font-semibold px-4 py-2 transition-colors"
                >
                  {saving && <i className="fas fa-spinner fa-spin"></i>}
                  {saving ? "Saving..." : "Save & Record"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100">
          <div className="px-6 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Subscription History
            </p>
          </div>
          {history.length === 0 ? (
            <p className="px-6 pb-5 text-sm text-slate-400">No subscription events recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((event: any) => (
                <div key={event._id} className="px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mr-2 ${
                        PLAN_BADGE[event.plan] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {event.plan}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        SUBSCRIPTION_BADGE[event.subscriptionStatus] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {event.subscriptionStatus}
                    </span>
                    {event.note && <p className="text-xs text-slate-500 mt-1">{event.note}</p>}
                  </div>
                  <div className="text-right">
                    {event.amount > 0 && (
                      <p className="font-semibold text-emerald-700">{formatCurrency(event.amount)}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      {moment(event.createdAt).format("Do MMM, YYYY | h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={TABLE_CARD_CLASS}>
        <div className={TABLE_HEADER_CLASS}>
          <h3 className="text-base font-semibold text-slate-800">Activity Log</h3>
          <p className="text-sm text-slate-500 mt-1">
            Recent staff actions inside this organization (most recent 100).
          </p>
        </div>
        {activityLog.length === 0 ? (
          <p className="px-6 py-5 text-sm text-slate-400">No activity recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {activityLog.map((log: any) => (
              <div
                key={log._id}
                className="px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <div>
                  <span className="font-semibold text-slate-700">{log.userLabel}</span>
                  <span className="text-slate-400"> &middot; {log.action}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{log.description}</p>
                </div>
                <p className="text-xs text-slate-400 flex-shrink-0">
                  {moment(log.createdAt).format("Do MMM, YYYY | h:mm a")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
