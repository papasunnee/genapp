"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { toast } from "@/components/ui/Toast";
import { confirmDialog } from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import ActionMenu from "@/components/ui/ActionMenu";
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

type ReferrerFormState = {
  name: string;
  type: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};
const EMPTY_FORM: ReferrerFormState = {
  name: "",
  type: "Doctor",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

function ReferrerForm({
  initial,
  submitLabel,
  loading,
  onSubmit,
}: {
  initial: ReferrerFormState;
  submitLabel: string;
  loading: boolean;
  onSubmit: (form: ReferrerFormState) => void;
}) {
  const [form, setForm] = useState(initial);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Dr. Adebayo Ola"
            maxLength={100}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className={INPUT_CLASS}
          >
            <option value="Doctor">Doctor</option>
            <option value="Clinic">Clinic</option>
          </select>
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
        <div>
          <label className={LABEL_CLASS}>
            Email <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            maxLength={150}
            className={INPUT_CLASS}
          />
        </div>
        <div className="md:col-span-2">
          <label className={LABEL_CLASS}>
            Address/Clinic <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            maxLength={150}
            className={INPUT_CLASS}
          />
        </div>
      </div>
      <div>
        <label className={LABEL_CLASS}>
          Notes <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={2}
          maxLength={500}
          className={INPUT_CLASS}
        ></textarea>
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

export default function ReferrersData() {
  const { data, mutate }: any = useSWR("/api/referrers", fetcher);
  const [modal, setModal] = useState<null | { mode: "create" } | { mode: "edit"; referrer: any }>(
    null
  );
  const [loading, setLoading] = useState(false);

  const referrers = data?.data ?? [];

  const handleCreate = async (form: ReferrerFormState) => {
    setLoading(true);
    try {
      const res = await fetch("/api/referrers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Referrer added");
        setModal(null);
        mutate();
      } else {
        toast.error(json.error || "Failed to add referrer");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleUpdate = async (id: string, form: ReferrerFormState) => {
    setLoading(true);
    try {
      const res = await fetch("/api/referrers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ put_id: id, ...form }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Referrer updated");
        setModal(null);
        mutate();
      } else {
        toast.error(json.error || "Failed to update referrer");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (referrer: any) => {
    const confirmed = await confirmDialog({
      title: "Delete referrer",
      message: `Delete "${referrer.name}"? Patients already linked to them will keep their history, just without a referrer name shown.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!confirmed) return;
    try {
      const res = await fetch("/api/referrers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delete_id: referrer._id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Referrer deleted");
        mutate();
      } else {
        toast.error(json.error || "Failed to delete referrer");
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
            Referring Doctors/Clinics ({referrers.length})
          </h6>
          <span className="font-normal text-xs md:text-sm text-slate-400">
            Track who refers patients to you and see referral volume by source
          </span>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase px-3 py-2 rounded-lg transition-colors space-x-1"
        >
          <i className="fas fa-plus"></i>
          <span>Add Referrer</span>
        </button>
      </div>

      {!data ? (
        <TableSkeleton columns={5} />
      ) : referrers.length > 0 ? (
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className={TABLE_TH_CLASS}>Name</th>
                <th className={TABLE_TH_CLASS}>Type</th>
                <th className={TABLE_TH_CLASS}>Contact</th>
                <th className={TABLE_TH_CLASS}>Patients Referred</th>
                <th className="px-6 align-middle border-b py-3 text-xs uppercase whitespace-nowrap font-semibold text-right tracking-wide bg-slate-50 text-slate-500 border-slate-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {referrers.map((referrer: any) => (
                <tr key={referrer._id} className={TABLE_TR_CLASS}>
                  <th className="px-6 align-middle text-sm p-3 text-left font-semibold text-slate-700">
                    {referrer.name}
                  </th>
                  <td className={TABLE_TD_CLASS}>{referrer.type}</td>
                  <td className={TABLE_TD_CLASS}>
                    {referrer.phone || referrer.email || "-"}
                  </td>
                  <td className={TABLE_TD_CLASS + " font-semibold"}>
                    {referrer.referredPatientCount}
                  </td>
                  <td className="px-6 align-middle text-sm p-3 text-right whitespace-nowrap">
                    <ActionMenu
                      items={[
                        {
                          label: "Edit",
                          icon: "fa-pen",
                          onClick: () => setModal({ mode: "edit", referrer }),
                        },
                        {
                          label: "Delete",
                          icon: "fa-trash-alt",
                          danger: true,
                          onClick: () => handleDelete(referrer),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="my-8">
          <p className="text-center text-sm text-slate-500">No referrers added yet.</p>
        </div>
      )}

      <Modal
        open={modal !== null}
        title={modal?.mode === "edit" ? `Edit ${modal.referrer.name}` : "Add Referrer"}
        onClose={() => setModal(null)}
      >
        {modal?.mode === "edit" && (
          <ReferrerForm
            key={modal.referrer._id}
            initial={{
              name: modal.referrer.name,
              type: modal.referrer.type,
              phone: modal.referrer.phone || "",
              email: modal.referrer.email || "",
              address: modal.referrer.address || "",
              notes: modal.referrer.notes || "",
            }}
            submitLabel="Save Changes"
            loading={loading}
            onSubmit={(form) => handleUpdate(modal.referrer._id, form)}
          />
        )}
        {modal?.mode === "create" && (
          <ReferrerForm
            initial={EMPTY_FORM}
            submitLabel="Add Referrer"
            loading={loading}
            onSubmit={handleCreate}
          />
        )}
      </Modal>
    </div>
  );
}
