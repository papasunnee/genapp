"use client";

import { useState } from "react";
import useSWR from "swr";
import moment from "moment";
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

const STATUS_BADGE: Record<string, string> = {
  Scheduled: "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-slate-100 text-slate-500",
  "No-show": "bg-red-50 text-red-700",
};

function todayStr() {
  return moment().format("YYYY-MM-DD");
}

function NewAppointmentForm({
  patients,
  onCreated,
}: {
  patients: any[];
  onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("09:00");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");

  const handleExistingPatientChange = (id: string) => {
    setPatientId(id);
    const found = patients.find((p) => p._id === id);
    if (found) {
      setPatientName(`${found.firstname} ${found.lastname}`);
      setPhone(found.phone || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          phone,
          patient: patientId || undefined,
          date,
          time,
          purpose,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Appointment booked");
        onCreated();
      } else {
        toast.error(data.error || "Failed to book appointment");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={LABEL_CLASS}>
          Link to existing patient{" "}
          <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <select
          value={patientId}
          onChange={(e) => handleExistingPatientChange(e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="">New / walk-in patient</option>
          {patients.map((p: any) => (
            <option key={p._id} value={p._id}>
              {p.firstname} {p.lastname}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Patient Name</label>
          <input
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
            maxLength={120}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>
            Phone <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>
          Purpose <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g. Sample collection - Full Blood Count"
          maxLength={200}
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>
          Notes <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
          <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-calendar-check"} mr-2`}></i>
          {loading ? "Booking..." : "Book Appointment"}
        </button>
      </div>
    </form>
  );
}

export default function AppointmentsData() {
  const [date, setDate] = useState(todayStr());
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading, mutate }: any = useSWR(
    `/api/appointments?date=${date}&status=${statusFilter}`,
    fetcher
  );
  const { data: patientData }: any = useSWR("/api/patients", fetcher);

  const appointments: any[] = data?.data ?? [];
  const patients: any[] = patientData?.data ?? [];

  const shiftDay = (delta: number) => {
    setDate(moment(date, "YYYY-MM-DD").add(delta, "day").format("YYYY-MM-DD"));
  };

  const handleStatusChange = async (appointment: any, status: string) => {
    setBusyId(appointment._id);
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appointment._id, status }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Marked ${status}`);
        mutate();
      } else {
        toast.error(json.error || "Failed to update appointment");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setBusyId(null);
  };

  const handleDelete = async (appointment: any) => {
    const confirmed = await confirmDialog({
      title: "Delete appointment",
      message: `Delete the appointment for ${appointment.patientName}? This can't be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!confirmed || busyId) return;

    setBusyId(appointment._id);
    try {
      const res = await fetch("/api/appointments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delete_id: appointment._id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Appointment deleted");
        mutate();
      } else {
        toast.error(json.error || "Failed to delete appointment");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setBusyId(null);
  };

  return (
    <div className="space-y-6">
      <div className={TABLE_CARD_CLASS}>
        <div className={`${TABLE_HEADER_CLASS} flex flex-wrap items-center gap-3`}>
          <div className="flex-grow">
            <h6 className="text-slate-800 text-md md:text-lg font-semibold">
              Appointments ({appointments.length})
            </h6>
            <span className="font-normal text-xs md:text-sm text-slate-400">
              Sample-collection and consultation bookings
            </span>
          </div>

          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => shiftDay(-1)}
              aria-label="Previous day"
              className="h-9 w-9 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50 flex items-center justify-center"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-slate-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => shiftDay(1)}
              aria-label="Next day"
              className="h-9 w-9 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50 flex items-center justify-center"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
            <button
              type="button"
              onClick={() => setDate(todayStr())}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 px-2"
            >
              Today
            </button>
          </div>

          <div className="inline-flex items-center bg-slate-100 rounded-lg p-1">
            {["All", "Scheduled", "Completed", "Cancelled", "No-show"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors ${
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
            Book Appointment
          </button>
        </div>

        {isLoading ? (
          <TableSkeleton columns={5} />
        ) : appointments.length > 0 ? (
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className={TABLE_TH_CLASS}>Time</th>
                  <th className={TABLE_TH_CLASS}>Patient</th>
                  <th className={TABLE_TH_CLASS}>Phone</th>
                  <th className={TABLE_TH_CLASS}>Purpose</th>
                  <th className={TABLE_TH_CLASS}>Status</th>
                  <th className="px-6 align-middle border-b py-3 text-xs uppercase whitespace-nowrap font-semibold text-right tracking-wide bg-slate-50 text-slate-500 border-slate-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt: any) => (
                  <tr key={appt._id} className={TABLE_TR_CLASS}>
                    <td className={TABLE_TD_CLASS + " font-mono"}>
                      {moment(appt.scheduledFor).format("h:mm a")}
                    </td>
                    <td className={TABLE_TD_CLASS + " font-medium"}>{appt.patientName}</td>
                    <td className={TABLE_TD_CLASS}>{appt.phone || "-"}</td>
                    <td className={TABLE_TD_CLASS}>{appt.purpose || "-"}</td>
                    <td className={TABLE_TD_CLASS}>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          STATUS_BADGE[appt.status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 align-middle text-sm p-3 text-right whitespace-nowrap">
                      <ActionMenu
                        items={[
                          {
                            label: "Mark Completed",
                            icon: "fa-check-circle",
                            disabled: busyId === appt._id || appt.status === "Completed",
                            onClick: () => handleStatusChange(appt, "Completed"),
                          },
                          {
                            label: "Mark No-show",
                            icon: "fa-user-slash",
                            disabled: busyId === appt._id || appt.status === "No-show",
                            onClick: () => handleStatusChange(appt, "No-show"),
                          },
                          {
                            label: "Cancel",
                            icon: "fa-ban",
                            disabled: busyId === appt._id || appt.status === "Cancelled",
                            onClick: () => handleStatusChange(appt, "Cancelled"),
                          },
                          {
                            label: "Delete",
                            icon: "fa-trash-alt",
                            danger: true,
                            disabled: busyId === appt._id,
                            onClick: () => handleDelete(appt),
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
            <p className="text-center text-sm text-slate-500">
              No appointments booked for {moment(date, "YYYY-MM-DD").format("Do MMM, YYYY")}.
            </p>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title="Book Appointment" onClose={() => setModalOpen(false)}>
        <NewAppointmentForm
          patients={patients}
          onCreated={() => {
            setModalOpen(false);
            mutate();
          }}
        />
      </Modal>
    </div>
  );
}
