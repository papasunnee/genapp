import { Connection, Document, Model, Schema } from "mongoose";

export interface IBranch extends Document {
  name: string;
  address?: string;
  phone?: string;
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A lab location within an organization - patients (and, in future, staff/
 * tests) can be tagged to one so a multi-location lab shares one patient
 * registry across branches instead of running a separate tenant per site.
 * Enterprise-only, gated by planLimits.multiBranch.
 */
const BranchSchema = new Schema<IBranch>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this branch."],
      maxlength: [100, "Branch name cannot be more than 100 characters"],
    },
    address: {
      type: String,
      maxlength: [150, "Address cannot be more than 150 characters"],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone cannot be more than 20 characters"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export function getBranchModel(connection: Connection): Model<IBranch> {
  return (
    (connection.models.Branch as Model<IBranch>) ||
    connection.model<IBranch>("Branch", BranchSchema)
  );
}
