import { Connection, Document, Model, Schema, Types } from "mongoose";

export type AppointmentStatus = "Scheduled" | "Completed" | "Cancelled" | "No-show";

export interface IAppointment extends Document {
  patientName: string;
  phone?: string;
  patient?: Types.ObjectId;
  scheduledFor: Date;
  purpose?: string;
  status: AppointmentStatus;
  notes?: string;
  createdBy?: Types.ObjectId;
  createdByLabel: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A booked sample-collection/consultation slot. `patientName`/`phone` are
 * captured directly (a walk-in booking someone ahead of time may not be a
 * registered patient yet) - `patient` is an optional link for when the
 * booking is for someone already in the registry.
 */
const AppointmentSchema = new Schema<IAppointment>(
  {
    patientName: {
      type: String,
      required: [true, "Please provide the patient's name."],
      maxlength: [120, "Name cannot be more than 120 characters"],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone cannot be more than 20 characters"],
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    scheduledFor: {
      type: Date,
      required: [true, "Please provide a date and time for this appointment."],
    },
    purpose: {
      type: String,
      maxlength: [200, "Purpose cannot be more than 200 characters"],
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "No-show"],
      default: "Scheduled",
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot be more than 500 characters"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdByLabel: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

AppointmentSchema.index({ scheduledFor: 1 });

export function getAppointmentModel(connection: Connection): Model<IAppointment> {
  return (
    (connection.models.Appointment as Model<IAppointment>) ||
    connection.model<IAppointment>("Appointment", AppointmentSchema)
  );
}
