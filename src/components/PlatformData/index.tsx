"use client";

import { useState } from "react";
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
const SELECT_CLASS =
  "border border-slate-300 rounded-lg text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors";

const PLANS = ["Free", "Pro", "Enterprise"];
const SUBSCRIPTION_STATUSES = ["Trial", "Active", "Expired", "Cancelled"];

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

  return (
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
                    <span className="font-semibold text-slate-700 block">
                      {org.name}
                    </span>
                    <span className="text-xs text-slate-400">{org.subdomain}</span>
                  </th>
                  <td className={TABLE_TD_CLASS}>
                    <StatusBadge status={org.status} />
                  </td>
                  <td className={TABLE_TD_CLASS}>
                    <select
                      value={org.plan}
                      onChange={(e) => updateOrg(org._id, { plan: e.target.value })}
                      className={SELECT_CLASS}
                    >
                      {PLANS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={TABLE_TD_CLASS}>
                    <div className="space-y-1">
                      <select
                        value={org.subscriptionStatus}
                        onChange={(e) =>
                          updateOrg(org._id, { subscriptionStatus: e.target.value })
                        }
                        className={SELECT_CLASS}
                      >
                        {SUBSCRIPTION_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={
                          org.subscriptionRenewsAt
                            ? String(org.subscriptionRenewsAt).slice(0, 10)
                            : ""
                        }
                        onChange={(e) =>
                          updateOrg(org._id, { subscriptionRenewsAt: e.target.value })
                        }
                        title="Renews on"
                        className={SELECT_CLASS + " block text-xs"}
                      />
                    </div>
                  </td>
                  <td className="px-6 align-middle text-sm p-3 text-right space-x-3 whitespace-nowrap">
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

      <Modal open={modalOpen} title="Add Organization" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>Organization Name</label>
            <input
              required
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
              pattern="[a-z0-9-]+"
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
