import { Connection, Document, Model, Schema, Types } from "mongoose";

export interface IQCLog extends Document {
  analyzer: string;
  testName: string;
  controlLevel: string;
  expectedRange?: string;
  observedValue: string;
  status: "Pass" | "Fail";
  correctiveAction?: string;
  notes?: string;
  performedBy?: Types.ObjectId;
  performedByLabel: string;
  performedAt: Date;
  createdAt: Date;
}

/**
 * Daily QC log entries per analyzer - a compliance record labs are
 * typically required to keep on paper. Append-only, same rationale as
 * ActivityLog: a corrected reading is a new entry, not an edit, so the
 * audit trail always shows what was actually observed at the time.
 */
const QCLogSchema = new Schema<IQCLog>(
  {
    analyzer: {
      type: String,
      required: [true, "Please provide the analyzer/instrument name."],
      maxlength: 100,
    },
    testName: {
      type: String,
      required: [true, "Please provide the test or parameter being controlled."],
      maxlength: 100,
    },
    controlLevel: {
      type: String,
      required: [true, "Please provide the control level (e.g. Level 1, Level 2)."],
      maxlength: 60,
    },
    expectedRange: {
      type: String,
      maxlength: 100,
    },
    observedValue: {
      type: String,
      required: [true, "Please provide the observed control value."],
      maxlength: 60,
    },
    status: {
      type: String,
      enum: ["Pass", "Fail"],
      required: true,
    },
    correctiveAction: {
      type: String,
      maxlength: 500,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    performedByLabel: {
      type: String,
      required: true,
    },
    performedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

QCLogSchema.index({ performedAt: -1 });

export function getQCLogModel(connection: Connection): Model<IQCLog> {
  return (
    (connection.models.QCLog as Model<IQCLog>) ||
    connection.model<IQCLog>("QCLog", QCLogSchema)
  );
}
