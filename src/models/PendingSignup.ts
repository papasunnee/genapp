import { Connection, Document, Model, Schema } from "mongoose";
import { PayablePlan } from "@/lib/pricing";

export interface IPendingSignup extends Document {
  reference: string;
  organizationName: string;
  subdomain: string;
  adminFirstname: string;
  adminLastname: string;
  adminEmail: string;
  adminPassword: string;
  plan: PayablePlan;
  billing: "monthly" | "yearly";
  createdAt: Date;
}

/**
 * Holds a self-serve signup's form data between "checkout started" and
 * "payment confirmed" - keyed by the Paystack transaction reference, since
 * provisioning can be triggered by either the webhook or the callback page
 * (whichever arrives first), possibly in a separate server invocation with
 * no memory of the original request. Consumed (deleted) once an
 * Organization is successfully created from it; auto-expires on its own
 * otherwise so an abandoned checkout doesn't linger holding a plaintext
 * password indefinitely.
 */
const PendingSignupSchema = new Schema<IPendingSignup>(
  {
    reference: { type: String, required: true, unique: true },
    organizationName: { type: String, required: true },
    subdomain: { type: String, required: true },
    adminFirstname: { type: String, required: true },
    adminLastname: { type: String, required: true },
    adminEmail: { type: String, required: true },
    adminPassword: { type: String, required: true },
    plan: { type: String, required: true, enum: ["Starter", "Pro"] },
    billing: { type: String, required: true, enum: ["monthly", "yearly"] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PendingSignupSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export function getPendingSignupModel(connection: Connection): Model<IPendingSignup> {
  return (
    (connection.models.PendingSignup as Model<IPendingSignup>) ||
    connection.model<IPendingSignup>("PendingSignup", PendingSignupSchema)
  );
}
