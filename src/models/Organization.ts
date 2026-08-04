import { Connection, Document, Model, Schema } from "mongoose";

export type OrganizationPlan = "Free" | "Starter" | "Pro" | "Enterprise";
export type SubscriptionStatus = "Trial" | "Active" | "Expired" | "Cancelled";

export interface IOrganization extends Document {
  name: string;
  subdomain: string;
  dbName: string;
  status: "Active" | "Suspended";
  plan: OrganizationPlan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionRenewsAt?: Date;
  logo?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  contactEmail?: string;
  isDemo: boolean;
  demoLastResetAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this organization."],
      maxlength: [120, "Name cannot be more than 120 characters"],
    },
    subdomain: {
      type: String,
      required: [true, "Please provide a subdomain for this organization."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/,
        "Subdomain must be a valid DNS label (lowercase letters, digits, hyphens).",
      ],
    },
    dbName: {
      type: String,
      required: [true, "Please provide a database name for this organization."],
      unique: true,
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Suspended"],
    },
    plan: {
      type: String,
      default: "Free",
      enum: ["Free", "Starter", "Pro", "Enterprise"],
    },
    subscriptionStatus: {
      type: String,
      default: "Trial",
      enum: ["Trial", "Active", "Expired", "Cancelled"],
    },
    subscriptionRenewsAt: {
      type: Date,
    },
    logo: {
      type: String,
    },
    tagline: {
      type: String,
      maxlength: [150, "Tagline cannot be more than 150 characters"],
    },
    address: {
      type: String,
      maxlength: [200, "Address cannot be more than 200 characters"],
    },
    phone: {
      type: String,
      maxlength: [60, "Phone cannot be more than 60 characters"],
    },
    contactEmail: {
      type: String,
      maxlength: [100, "Email cannot be more than 100 characters"],
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    demoLastResetAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export function getOrganizationModel(
  connection: Connection
): Model<IOrganization> {
  return (
    (connection.models.Organization as Model<IOrganization>) ||
    connection.model<IOrganization>("Organization", OrganizationSchema)
  );
}
