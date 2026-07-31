import { Connection, Document, Model, Schema, Types } from "mongoose";
import { OrganizationPlan, SubscriptionStatus } from "./Organization";

export interface ISubscriptionEvent extends Document {
  organization: Types.ObjectId;
  plan: OrganizationPlan;
  subscriptionStatus: SubscriptionStatus;
  amount: number;
  renewsAt?: Date;
  note?: string;
  createdAt: Date;
}

/**
 * Append-only audit log of subscription/plan changes for an organization.
 * Lives on the control-plane connection alongside Organization - one entry
 * is written every time a platform admin changes plan, status, renewal
 * date, or records a payment, so "what did this org's subscription look
 * like on any given date" is always answerable, not just "what is it now."
 */
const SubscriptionEventSchema = new Schema<ISubscriptionEvent>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    plan: {
      type: String,
      required: true,
      enum: ["Free", "Pro", "Enterprise"],
    },
    subscriptionStatus: {
      type: String,
      required: true,
      enum: ["Trial", "Active", "Expired", "Cancelled"],
    },
    amount: {
      type: Number,
      default: 0,
    },
    renewsAt: {
      type: Date,
    },
    note: {
      type: String,
      maxlength: [300, "Note cannot be more than 300 characters"],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export function getSubscriptionEventModel(
  connection: Connection
): Model<ISubscriptionEvent> {
  return (
    (connection.models.SubscriptionEvent as Model<ISubscriptionEvent>) ||
    connection.model<ISubscriptionEvent>("SubscriptionEvent", SubscriptionEventSchema)
  );
}
