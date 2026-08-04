"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { toast } from "@/components/ui/Toast";
import { confirmDialog } from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import TableSkeleton from "@/components/PatientsData/TableSkeleton";
import {
  TABLE_CARD_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_TH_CLASS,
  TABLE_TR_CLASS,
  TABLE_TD_CLASS,
} from "@/components/ui/table";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";
const LABEL_CLASS = "block text-sm font-medium text-slate-700 mb-1";

const EMPTY_FORM = {
  name: "",
  subdomain: "",
  adminFirstname: "",
  adminLastname: "",
  adminEmail: "",
  adminPassword: "",
};

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "Active";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
        isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {status}
    </span>
  );
}

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

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function PlatformData() {
  const { data, isLoading, mutate }: any = useSWR("/api/organizations", fetcher);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const organizations = data?.data ?? [];

  const updateOrg = async (id: string, update: Record<string, any>) => {
    try {
      const res = await fetch("/api/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...update }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Organization updated");
        mutate();
      } else {
        toast.error(json.error || "Failed to update organization");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleStatus = async (org: any) => {
    const nextStatus = org.status === "Active" ? "Suspended" : "Active";
    if (nextStatus === "Suspended") {
      const confirmed = await confirmDialog({
        title: "Suspend organization",
        message: `Suspend "${org.name}"? Their staff will not be able to sign in until reactivated.`,
        confirmLabel: "Suspend",
        cancelLabel: "Cancel",
        danger: true,
      });
      if (!confirmed) return;
    }
    updateOrg(org._id, { status: nextStatus });
  };

  const handleDelete = async (org: any) => {
    const confirmed = await confirmDialog({
      title: "Delete organization",
      message: `This permanently deletes "${org.name}" and every patient, test, payment, and staff record in it. This cannot be undone.`,
      confirmLabel: "Delete permanently",
      cancelLabel: "Cancel",
      danger: true,
      confirmText: org.subdomain,
    });
    if (!confirmed) return;

    try {
      const res = await fetch("/api/organizations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: org._id, confirmSubdomain: org.subdomain }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`"${org.name}" deleted`);
        mutate();
      } else {
        toast.error(json.error || "Failed to delete organization");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Organization created");
        setModalOpen(false);
        setForm(EMPTY_FORM);
        mutate();
      } else {
        toast.error(json.error || "Failed to create organization");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setCreating(false);
  };

  const activeCount = organizations.filter((o: any) => o.status === "Active").length;
  const trialCount = organizations.filter((o: any) => o.subscriptionStatus === "Trial").length;
  const suspendedCount = organizations.filter((o: any) => o.status === "Suspended").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Organizations" value={organizations.length} icon="fa-building" />
        <StatCard label="Active" value={activeCount} icon="fa-check-circle" />
        <StatCard label="On Trial" value={trialCount} icon="fa-hourglass-half" />
        <StatCard label="Suspended" value={suspendedCount} icon="fa-ban" />
      </div>

      <div className={TABLE_CARD_CLASS}>
        <div className={TABLE_HEADER_CLASS}>
          <div className="flex flex-wrap items-center">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <h6 className="text-slate-800 text-md md:text-lg font-semibold">
                Organizations ({organizations.length})
              </h6>
              <span className="font-normal text-xs md:text-sm text-slate-400">
                Manage tenant lifecycle and subscriptions
              </span>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase px-3 py-2 rounded-lg transition-colors space-x-1"
            >
              <i className="fas fa-plus"></i>
              <span>Add Organization</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton columns={5} />
        ) : organizations.length > 0 ? (
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className={TABLE_TH_CLASS}>Organization</th>
                  <th className={TABLE_TH_CLASS}>Status</th>
                  <th className={TABLE_TH_CLASS}>Plan</th>
                  <th className={TABLE_TH_CLASS}>Subscription</th>
                  <th className="px-6 align-middle border-b py-3 text-xs uppercase whitespace-nowrap font-semibold text-right tracking-wide bg-slate-50 text-slate-500 border-slate-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org: any) => (
                  <tr key={org._id} className={TABLE_TR_CLASS}>
                    <th className="px-6 align-middle text-sm p-3 text-left">
                      <Link
                        href={`/platform/organizations/${org._id}`}
                        className="font-semibold text-slate-700 hover:text-brand-600 hover:underline block"
                      >
                        {org.name}
                      </Link>
                      <span className="text-xs text-slate-400">{org.subdomain}</span>
                    </th>
                    <td className={TABLE_TD_CLASS}>
                      <StatusBadge status={org.status} />
                    </td>
                    <td className={TABLE_TD_CLASS}>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          PLAN_BADGE[org.plan] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {org.plan}
                      </span>
                    </td>
                    <td className={TABLE_TD_CLASS}>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          SUBSCRIPTION_BADGE[org.subscriptionStatus] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {org.subscriptionStatus}
                      </span>
                      {org.subscriptionRenewsAt && (
                        <span className="block text-[11px] text-slate-400 mt-1">
                          Renews {String(org.subscriptionRenewsAt).slice(0, 10)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 align-middle text-sm p-3 text-right space-x-3 whitespace-nowrap">
                      <Link
                        href={`/platform/organizations/${org._id}`}
                        className="text-xs font-semibold uppercase text-brand-600 hover:text-brand-800"
                      >
                        Manage
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(org)}
                        className={`text-xs font-semibold uppercase ${
                          org.status === "Active"
                            ? "text-red-600 hover:text-red-800"
                            : "text-emerald-600 hover:text-emerald-800"
                        }`}
                      >
                        {org.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(org)}
                        className="text-xs font-semibold uppercase text-slate-400 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="my-8">
          <p className="text-center text-sm text-slate-500">
            No organizations yet, click Add Organization to create the first one.
          </p>
        </div>
      )}
      </div>

      <Modal open={modalOpen} title="Add Organization" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>Organization Name</label>
            <input
              required
              maxLength={120}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>
              Subdomain{" "}
              <span className="text-slate-400 font-normal normal-case">
                (e.g. acmelabs)
              </span>
            </label>
            <input
              required
              maxLength={63}
              pattern="[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?"
              title="Lowercase letters, digits, and hyphens - must start and end with a letter or digit"
              value={form.subdomain}
              onChange={(e) =>
                setForm((f) => ({ ...f, subdomain: e.target.value.toLowerCase() }))
              }
              className={INPUT_CLASS}
            />
          </div>
          <hr className="border-slate-100" />
          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wide">
            First Admin Account
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>First Name</label>
              <input
                required
                maxLength={60}
                value={form.adminFirstname}
                onChange={(e) =>
                  setForm((f) => ({ ...f, adminFirstname: e.target.value }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Last Name</label>
              <input
                required
                maxLength={60}
                value={form.adminLastname}
                onChange={(e) =>
                  setForm((f) => ({ ...f, adminLastname: e.target.value }))
                }
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Email</label>
            <input
              type="email"
              required
              value={form.adminEmail}
              onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Password</label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              value={form.adminPassword}
              onChange={(e) =>
                setForm((f) => ({ ...f, adminPassword: e.target.value }))
              }
              className={INPUT_CLASS}
            />
          </div>
          <div className="pt-2 border-t border-slate-100">
            <button
              disabled={creating}
              className="mt-4 w-full inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 transition-colors"
            >
              {creating ? "Creating..." : "Create Organization"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
