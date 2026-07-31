"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { toast } from "@/components/ui/Toast";
import { confirmDialog } from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import UpgradeNotice from "@/components/ui/UpgradeNotice";
import TableSkeleton from "@/components/PatientsData/TableSkeleton";
import {
  TABLE_CARD_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_TH_CLASS,
  TABLE_TR_CLASS,
  TABLE_TD_CLASS,
} from "@/components/ui/table";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";
const LABEL_CLASS = "block text-sm font-medium text-slate-700 mb-1";

const STANDARD_WEIGHTS = [
  { weight: 100, label: "100 - Super Admin" },
  { weight: 200, label: "200 - Admin" },
  { weight: 300, label: "300 - Lab Technician" },
  { weight: 400, label: "400 - Accountant" },
  { weight: 500, label: "500 - Front Desk" },
];

const EMPTY_FORM = { name: "", weight: "" };

function RoleForm({
  initial,
  submitLabel,
  loading,
  onSubmit,
}: {
  initial: { name: string; weight: string };
  submitLabel: string;
  loading: boolean;
  onSubmit: (form: { name: string; weight: string }) => void;
}) {
  const [form, setForm] = useState(initial);
  const isStandardWeight = STANDARD_WEIGHTS.some((w) => String(w.weight) === String(form.weight));

  return (
    <div className="space-y-4">
      <div>
        <label className={LABEL_CLASS}>Role Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Senior Lab Technician"
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label className={LABEL_CLASS}>Weight</label>
        <input
          type="number"
          value={form.weight}
          onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
          placeholder="e.g. 300"
          className={INPUT_CLASS}
        />
        <p className="text-xs text-slate-500 mt-1.5">
          Weight controls what parts of the app this role can reach. Each role needs a unique
          weight. The standard tiers are:
        </p>
        <ul className="text-xs text-slate-400 mt-1 space-y-0.5">
          {STANDARD_WEIGHTS.map((w) => (
            <li key={w.weight}>{w.label}</li>
          ))}
        </ul>
        {form.weight && !isStandardWeight && (
          <p className="text-xs text-amber-600 mt-1.5">
            <i className="fas fa-exclamation-triangle mr-1"></i>
            This weight doesn&apos;t match a standard tier - staff with this role will only reach
            areas that aren&apos;t restricted to a specific role weight.
          </p>
        )}
      </div>
      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          disabled={loading || !form.name.trim() || form.weight === ""}
          onClick={() => onSubmit(form)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
        >
          {loading && <i className="fas fa-spinner fa-spin"></i>}
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

export default function RolesData() {
  const { data, mutate }: any = useSWR("/api/role?all=true", fetcher);
  const { data: planData }: any = useSWR("/api/organization/plan", fetcher);
  const [modal, setModal] = useState<null | { mode: "create" } | { mode: "edit"; role: any }>(
    null
  );
  const [loading, setLoading] = useState(false);

  const roles = data?.data ?? [];
  const canManage = planData?.data?.limits?.customRoles ?? true;

  const handleCreate = async (form: { name: string; weight: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, weight: form.weight }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Role created");
        setModal(null);
        mutate();
      } else {
        toast.error(json.error || "Failed to create role");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleUpdate = async (id: string, form: { name: string; weight: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ put_id: id, name: form.name, weight: form.weight }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Role updated");
        setModal(null);
        mutate();
      } else {
        toast.error(json.error || "Failed to update role");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (role: any) => {
    const nextStatus = role.status === "Disabled" ? "Active" : "Disabled";
    try {
      const res = await fetch("/api/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ put_id: role._id, status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          nextStatus === "Disabled"
            ? "Role disabled - it can no longer be assigned to new staff"
            : "Role re-enabled"
        );
        mutate();
      } else {
        toast.error(json.error || "Failed to update role");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (role: any) => {
    const confirmed = await confirmDialog({
      title: "Delete role",
      message: `Delete "${role.name}"? ${
        role.staffCount > 0
          ? `${role.staffCount} staff member(s) currently have this role and must be reassigned first.`
          : "This cannot be undone."
      }`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!confirmed) return;
    try {
      const res = await fetch("/api/role", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delete_id: role._id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Role deleted");
        mutate();
      } else {
        toast.error(json.error || "Failed to delete role");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className={TABLE_CARD_CLASS}>
      <div className={`${TABLE_HEADER_CLASS} flex flex-wrap items-start justify-between gap-3`}>
        <div>
          <h6 className="text-slate-800 text-md md:text-lg font-semibold">
            Roles ({roles.length})
          </h6>
          <span className="font-normal text-xs md:text-sm text-slate-400">
            What each role can access is determined by its weight
          </span>
        </div>
        {canManage && (
          <button
            onClick={() => setModal({ mode: "create" })}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase px-3 py-2 rounded-lg transition-colors space-x-1"
          >
            <i className="fas fa-plus"></i>
            <span>Add Role</span>
          </button>
        )}
      </div>

      {!canManage && (
        <div className="px-6 pt-4">
          <UpgradeNotice
            title="Custom roles are a Pro feature"
            message="You're using the standard role set. Upgrade to Pro to rename roles, adjust weights, or add new ones."
          />
        </div>
      )}

      {!data ? (
        <TableSkeleton columns={4} />
      ) : (
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className={TABLE_TH_CLASS}>Role</th>
                <th className={TABLE_TH_CLASS}>Weight</th>
                <th className={TABLE_TH_CLASS}>Staff</th>
                <th className={TABLE_TH_CLASS}>Status</th>
                {canManage && (
                  <th className="px-6 align-middle border-b py-3 text-xs uppercase whitespace-nowrap font-semibold text-right tracking-wide bg-slate-50 text-slate-500 border-slate-100">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {roles.map((role: any) => (
                <tr key={role._id} className={TABLE_TR_CLASS}>
                  <th className="px-6 align-middle text-sm p-3 text-left font-semibold text-slate-700">
                    {role.name}
                  </th>
                  <td className={TABLE_TD_CLASS}>{role.weight}</td>
                  <td className={TABLE_TD_CLASS}>{role.staffCount}</td>
                  <td className={TABLE_TD_CLASS}>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        role.status === "Disabled"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {role.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-6 align-middle text-sm p-3 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => setModal({ mode: "edit", role })}
                        className="text-xs font-semibold uppercase text-brand-600 hover:text-brand-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(role)}
                        className="text-xs font-semibold uppercase text-slate-500 hover:text-slate-700"
                      >
                        {role.status === "Disabled" ? "Enable" : "Disable"}
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
                        className="text-xs font-semibold uppercase text-slate-400 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modal !== null}
        title={modal?.mode === "edit" ? `Edit ${modal.role.name}` : "Add Role"}
        onClose={() => setModal(null)}
      >
        {modal?.mode === "edit" && (
          <RoleForm
            key={modal.role._id}
            initial={{ name: modal.role.name, weight: String(modal.role.weight) }}
            submitLabel="Save Changes"
            loading={loading}
            onSubmit={(form) => handleUpdate(modal.role._id, form)}
          />
        )}
        {modal?.mode === "create" && (
          <RoleForm
            initial={EMPTY_FORM}
            submitLabel="Create Role"
            loading={loading}
            onSubmit={handleCreate}
          />
        )}
      </Modal>
    </div>
  );
}
