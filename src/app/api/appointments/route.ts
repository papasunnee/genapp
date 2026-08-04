import { NextResponse } from "next/server";
import moment from "moment";
import { Types } from "mongoose";
import { getAppointmentModel } from "@/models/Appointment";
import { withTenant } from "@/lib/apiTenant";
import { hasPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";

const { ObjectId } = Types;
const VALID_STATUSES = ["Scheduled", "Completed", "Cancelled", "No-show"] as const;

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Appointment = getAppointmentModel(tenant.connection);
  const date = req.nextUrl.searchParams.get("date");
  const status = req.nextUrl.searchParams.get("status");

  const query: Record<string, any> = {};
  if (date) {
    const dayStart = moment(date, "YYYY-MM-DD", true);
    if (!dayStart.isValid()) {
      return NextResponse.json({ success: false, error: "Invalid date" }, { status: 400 });
    }
    query.scheduledFor = {
      $gte: dayStart.startOf("day").toDate(),
      $lt: dayStart.clone().add(1, "day").startOf("day").toDate(),
    };
  }
  if (status && status !== "All") query.status = status;

  try {
    const appointments = await Appointment.find(query)
      .populate("patient")
      .sort({ scheduledFor: 1 });
    return NextResponse.json({ success: true, data: appointments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Appointment = getAppointmentModel(tenant.connection);
  try {
    const body = await req.json();
    const { patientName, phone, patient, date, time, purpose, notes } = body as Record<
      string,
      any
    >;

    if (
      !patientName || typeof patientName !== "string" || !patientName.trim() ||
      !date || typeof date !== "string" ||
      !time || typeof time !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "Patient name, date, and time are required." },
        { status: 400 }
      );
    }
    const scheduledFor = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm", true);
    if (!scheduledFor.isValid()) {
      return NextResponse.json(
        { success: false, error: "Invalid date or time." },
        { status: 400 }
      );
    }
    if (patient && !ObjectId.isValid(patient)) {
      return NextResponse.json({ success: false, error: "Invalid patient id" }, { status: 400 });
    }

    const user = session.user as any;
    const newAppointment = await Appointment.create({
      patientName: patientName.trim(),
      phone: typeof phone === "string" ? phone.trim() : undefined,
      patient: patient || undefined,
      scheduledFor: scheduledFor.toDate(),
      purpose: typeof purpose === "string" ? purpose.trim() : undefined,
      notes: typeof notes === "string" ? notes.trim() : undefined,
      createdBy: user?._id,
      createdByLabel: `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim() || "Unknown",
    });

    await logActivity(
      tenant.connection,
      session,
      "appointment.created",
      `Booked appointment for ${patientName.trim()} on ${scheduledFor.format("Do MMM YYYY, h:mm a")}`
    );

    return NextResponse.json({ success: true, data: newAppointment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});

export const PATCH = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Appointment = getAppointmentModel(tenant.connection);
  try {
    const body = await req.json();
    const { id, status } = body as { id?: string; status?: string };
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }
    if (!status || !VALID_STATUSES.includes(status as any)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const updated = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const DELETE = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user?.role, "deleteRecords")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const Appointment = getAppointmentModel(tenant.connection);
  try {
    const body = await req.json();
    const delete_id = body.delete_id;
    if (typeof delete_id !== "string" || !ObjectId.isValid(delete_id)) {
      return NextResponse.json({ success: false, error: "Invalid delete_id" }, { status: 400 });
    }

    await Appointment.deleteOne({ _id: delete_id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
