import { Connection, Document, Model, Schema } from "mongoose";

export interface IReferrer extends Document {
  name: string;
  type: "Doctor" | "Clinic";
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A referring physician or partner clinic - tracked so the lab can report
 * results back to the right referrer and see referral volume by source,
 * for relationship management and billing reconciliation with partners.
 */
const ReferrerSchema = new Schema<IReferrer>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this referrer."],
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    type: {
      type: String,
      enum: ["Doctor", "Clinic"],
      required: true,
      default: "Doctor",
    },
    phone: {
      type: String,
      maxlength: [20, "Phone cannot be more than 20 characters"],
    },
    email: {
      type: String,
      maxlength: [150, "Email cannot be more than 150 characters"],
    },
    address: {
      type: String,
      maxlength: [150, "Address cannot be more than 150 characters"],
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot be more than 500 characters"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export function getReferrerModel(connection: Connection): Model<IReferrer> {
  return (
    (connection.models.Referrer as Model<IReferrer>) ||
    connection.model<IReferrer>("Referrer", ReferrerSchema)
  );
}
