import { Connection, Document, Model, Schema, Types } from "mongoose";

export type MaintenanceType = "Calibration" | "Maintenance" | "Repair";

export interface IMaintenanceLog extends Document {
  analyzer: string;
  type: MaintenanceType;
  performedAt: Date;
  description: string;
  nextDueDate?: Date;
  performedBy?: Types.ObjectId;
  performedByLabel: string;
  createdAt: Date;
}

/**
 * A manual calibration/maintenance/repair log per analyzer - regulatory
 * bodies often require this on file even before attempting real analyzer
 * interfacing (HL7/ASTM), which is a much bigger lift. Append-only, same
 * rationale as QCLog/ActivityLog: a correction is a new entry, not an edit.
 */
const MaintenanceLogSchema = new Schema<IMaintenanceLog>(
  {
    analyzer: {
      type: String,
      required: [true, "Please provide the analyzer/instrument name."],
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ["Calibration", "Maintenance", "Repair"],
      required: true,
    },
    performedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      required: [true, "Please describe what was done."],
      maxlength: 500,
    },
    nextDueDate: {
      type: Date,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    performedByLabel: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

MaintenanceLogSchema.index({ performedAt: -1 });

export function getMaintenanceLogModel(connection: Connection): Model<IMaintenanceLog> {
  return (
    (connection.models.MaintenanceLog as Model<IMaintenanceLog>) ||
    connection.model<IMaintenanceLog>("MaintenanceLog", MaintenanceLogSchema)
  );
}
