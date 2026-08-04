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
  TABLE_CARD_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_TH_CLASS,
  TABLE_TR_CLASS,
  TABLE_TD_CLASS,
} from "@/components/ui/table";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";
const LABEL_CLASS = "block text-sm font-medium text-slate-700 mb-1";

type BranchFormState = { name: string; address: string; phone: string; status: string };
const EMPTY_FORM: BranchFormState = { name: "", address: "", phone: "", status: "Active" };

function BranchForm({
  initial,
  submitLabel,
  loading,
  onSubmit,
}: {
  initial: BranchFormState;
  submitLabel: string;
  loading: boolean;
  onSubmit: (form: BranchFormState) => void;
}) {
  const [form, setForm] = useState(initial);

  return (
    <div className="space-y-4">
      <div>
        <label className={LABEL_CLASS}>Branch Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Ikeja Branch"
          maxLength={100}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label className={LABEL_CLASS}>
          Address <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          maxLength={150}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label className={LABEL_CLASS}>
          Phone <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          maxLength={20}
          className={INPUT_CLASS}
        />
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

export default function BranchesData() {
  const { data, mutate }: any = useSWR("/api/branches", fetcher);
  const [modal, setModal] = useState<null | { mode: "create" } | { mode: "edit"; branch: any }>(
    null
  );
  const [loading, setLoading] = useState(false);

  const branches = data?.data ?? [];
  const multiBranch = data?.multiBranch ?? false;

  const handleCreate = async (form: BranchFormState) => {
    setLoading(true);
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Branch created");
        setModal(null);
        mutate();
      } else {
        toast.error(json.error || "Failed to create branch");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleUpdate = async (id: string, form: BranchFormState) => {
    setLoading(true);
    try {
      const res = await fetch("/api/branches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ put_id: id, ...form }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Branch updated");
        setModal(null);
        mutate();
      } else {
        toast.error(json.error || "Failed to update branch");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (branch: any) => {
    const nextStatus = branch.status === "Inactive" ? "Active" : "Inactive";
    try {
      const res = await fetch("/api/branches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ put_id: branch._id, status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(nextStatus === "Inactive" ? "Branch marked inactive" : "Branch re-activated");
        mutate();
      } else {
        toast.error(json.error || "Failed to update branch");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (branch: any) => {
    const confirmed = await confirmDialog({
      title: "Delete branch",
      message: `Delete "${branch.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!confirmed) return;
    try {
      const res = await fetch("/api/branches", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delete_id: branch._id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Branch deleted");
        mutate();
      } else {
        toast.error(json.error || "Failed to delete branch");
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
            Branches ({branches.length})
          </h6>
          <span className="font-normal text-xs md:text-sm text-slate-400">
            Locations sharing this organization&apos;s patient registry
          </span>
        </div>
        {multiBranch && (
          <button
            onClick={() => setModal({ mode: "create" })}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase px-3 py-2 rounded-lg transition-colors space-x-1"
          >
            <i className="fas fa-plus"></i>
            <span>Add Branch</span>
          </button>
        )}
      </div>

      {!multiBranch && (
        <div className="px-6 pt-4">
          <UpgradeNotice
            title="Multi-branch is an Enterprise feature"
            message="Upgrade to Enterprise to add multiple locations and assign patients to a branch."
          />
        </div>
      )}

      {!data ? (
        <TableSkeleton columns={3} />
      ) : branches.length > 0 ? (
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className={TABLE_TH_CLASS}>Branch</th>
                <th className={TABLE_TH_CLASS}>Address</th>
                <th className={TABLE_TH_CLASS}>Phone</th>
                <th className={TABLE_TH_CLASS}>Status</th>
                {multiBranch && (
                  <th className="px-6 align-middle border-b py-3 text-xs uppercase whitespace-nowrap font-semibold text-right tracking-wide bg-slate-50 text-slate-500 border-slate-100">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {branches.map((branch: any) => (
                <tr key={branch._id} className={TABLE_TR_CLASS}>
                  <th className="px-6 align-middle text-sm p-3 text-left font-semibold text-slate-700">
                    {branch.name}
                  </th>
                  <td className={TABLE_TD_CLASS}>{branch.address || "-"}</td>
                  <td className={TABLE_TD_CLASS}>{branch.phone || "-"}</td>
                  <td className={TABLE_TD_CLASS}>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        branch.status === "Inactive"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {branch.status}
                    </span>
                  </td>
                  {multiBranch && (
                    <td className="px-6 align-middle text-sm p-3 text-right whitespace-nowrap">
                      <ActionMenu
                        items={[
                          {
                            label: "Edit",
                            icon: "fa-pen",
                            onClick: () => setModal({ mode: "edit", branch }),
                          },
                          {
                            label: branch.status === "Inactive" ? "Activate" : "Deactivate",
                            icon: branch.status === "Inactive" ? "fa-check-circle" : "fa-ban",
                            onClick: () => handleToggleStatus(branch),
                          },
                          {
                            label: "Delete",
                            icon: "fa-trash-alt",
                            danger: true,
                            onClick: () => handleDelete(branch),
                          },
                        ]}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="my-8">
          <p className="text-center text-sm text-slate-500">No branches added yet.</p>
        </div>
      )}

      <Modal
        open={modal !== null}
        title={modal?.mode === "edit" ? `Edit ${modal.branch.name}` : "Add Branch"}
        onClose={() => setModal(null)}
      >
        {modal?.mode === "edit" && (
          <BranchForm
            key={modal.branch._id}
            initial={{
              name: modal.branch.name,
              address: modal.branch.address || "",
              phone: modal.branch.phone || "",
              status: modal.branch.status,
            }}
            submitLabel="Save Changes"
            loading={loading}
            onSubmit={(form) => handleUpdate(modal.branch._id, form)}
          />
        )}
        {modal?.mode === "create" && (
          <BranchForm
            initial={EMPTY_FORM}
            submitLabel="Create Branch"
            loading={loading}
            onSubmit={handleCreate}
          />
        )}
      </Modal>
    </div>
  );
}
