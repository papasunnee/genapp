"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { toast } from "@/components/ui/Toast";
import { confirmDialog } from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import ActionMenu from "@/components/ui/ActionMenu";
import UpgradeNotice from "@/components/ui/UpgradeNotice";
import TableSkeleton from "@/components/PatientsData/TableSkeleton";
import {
  ALL_PERMISSIONS,
  PERMISSION_LABELS,
  STANDARD_TIERS,
  tierDefaultsForWeight,
  Permission,
} from "@/lib/permissions";
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

type RoleFormState = {
  name: string;
  weight: string;
  permissionOverrides: Partial<Record<Permission, boolean>>;
};

const EMPTY_FORM: RoleFormState = { name: "", weight: "300", permissionOverrides: {} };

function tierName(weight: number): string {
  return STANDARD_TIERS.find((t) => t.weight === weight)?.name ?? `Weight ${weight}`;
}

function RoleForm({
  initial,
  submitLabel,
  loading,
  onSubmit,
}: {
  initial: RoleFormState;
  submitLabel: string;
  loading: boolean;
  onSubmit: (form: RoleFormState) => void;
}) {
  const [form, setForm] = useState(initial);
  const tierDefaults = tierDefaultsForWeight(Number(form.weight) || 0);

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
        <label className={LABEL_CLASS}>Base Level</label>
        <select
          value={form.weight}
          onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
          className={INPUT_CLASS}
        >
          {STANDARD_TIERS.map((tier) => (
            <option key={tier.weight} value={tier.weight}>
              {tier.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1.5">
          Every role starts from one of these standard levels. Add extra permissions below for
          anything beyond what this level normally includes.
        </p>
      </div>

      <div>
        <label className={LABEL_CLASS}>Permissions</label>
        <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
          {ALL_PERMISSIONS.map((permission) => {
            const includedByTier = tierDefaults[permission];
            const checked = includedByTier || !!form.permissionOverrides[permission];
            return (
              <label
                key={permission}
                className={`flex items-start gap-3 px-3 py-2.5 text-sm ${
                  includedByTier ? "bg-slate-50 text-slate-400" : "text-slate-700 cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={includedByTier}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      permissionOverrides: {
                        ...f.permissionOverrides,
                        [permission]: e.target.checked,
                      },
                    }))
                  }
                  className="mt-0.5"
                />
                <span>
                  {PERMISSION_LABELS[permission]}
                  {includedByTier && (
                    <span className="block text-xs text-slate-400">
                      Included in this level
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          disabled={loading || !form.name.trim()}
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
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const roles = data?.data ?? [];
  const canManage = planData?.data?.limits?.customRoles ?? true;

  const handleCreate = async (form: RoleFormState) => {
    setLoading(true);
    try {
      const res = await fetch("/api/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          weight: form.weight,
          permissionOverrides: form.permissionOverrides,
        }),
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

  const handleUpdate = async (id: string, form: RoleFormState) => {
    setLoading(true);
    try {
      const res = await fetch("/api/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          put_id: id,
          name: form.name,
          weight: form.weight,
          permissionOverrides: form.permissionOverrides,
        }),
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
    if (togglingId) return;
    const nextStatus = role.status === "Disabled" ? "Active" : "Disabled";
    setTogglingId(role._id);
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
    setTogglingId(null);
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
            Every role is based on a standard level, with optional extra permissions
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
            message="You're using the standard role set. Upgrade to Pro to rename roles, adjust levels, or add new ones."
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
                <th className={TABLE_TH_CLASS}>Base Level</th>
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
              {roles.map((role: any) => {
                const extraCount = Object.values(role.permissionOverrides || {}).filter(
                  Boolean
                ).length;
                return (
                  <tr key={role._id} className={TABLE_TR_CLASS}>
                    <th className="px-6 align-middle text-sm p-3 text-left font-semibold text-slate-700">
                      {role.name}
                    </th>
                    <td className={TABLE_TD_CLASS}>
                      {tierName(role.weight)}
                      {extraCount > 0 && (
                        <span className="block text-xs text-brand-600 font-medium">
                          +{extraCount} extra permission{extraCount === 1 ? "" : "s"}
                        </span>
                      )}
                    </td>
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
                      <td className="px-6 align-middle text-sm p-3 text-right whitespace-nowrap">
                        <ActionMenu
                          items={[
                            {
                              label: "Edit",
                              icon: "fa-pen",
                              onClick: () => setModal({ mode: "edit", role }),
                            },
                            {
                              label: role.status === "Disabled" ? "Enable" : "Disable",
                              icon: role.status === "Disabled" ? "fa-check-circle" : "fa-ban",
                              disabled: togglingId === role._id,
                              onClick: () => handleToggleStatus(role),
                            },
                            {
                              label: "Delete",
                              icon: "fa-trash-alt",
                              danger: true,
                              onClick: () => handleDelete(role),
                            },
                          ]}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
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
            initial={{
              name: modal.role.name,
              weight: String(modal.role.weight),
              permissionOverrides: modal.role.permissionOverrides || {},
            }}
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
