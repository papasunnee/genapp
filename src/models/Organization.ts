import { Connection, Document, Model, Schema } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  subdomain: string;
  dbName: string;
  status: "Active" | "Suspended";
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
