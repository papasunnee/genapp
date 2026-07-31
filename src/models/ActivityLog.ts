import { Connection, Document, Model, Schema, Types } from "mongoose";

export interface IActivityLog extends Document {
  user?: Types.ObjectId;
  userLabel: string;
  action: string;
  description: string;
  createdAt: Date;
}

/**
 * Append-only audit trail, one tenant database per organization (same
 * pattern as SubscriptionEvent on the control plane). `userLabel` is a
 * name+role snapshot taken at write time, not a live populate of `user` -
 * so the log stays readable even if that staff account is later removed.
 */
const ActivityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    userLabel: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export function getActivityLogModel(connection: Connection): Model<IActivityLog> {
  return (
    (connection.models.ActivityLog as Model<IActivityLog>) ||
    connection.model<IActivityLog>("ActivityLog", ActivityLogSchema)
  );
}
