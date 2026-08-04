import { Connection, Document, Model, Schema } from "mongoose";
import { ALL_PERMISSIONS, RolePermissions } from "@/lib/permissions";

export interface IRole extends Document {
  name: string;
  weight: number;
  status: "Active" | "Disabled";
  // Only ever stores explicit `true` grants beyond the base tier's own
  // defaults (see src/lib/permissions.ts) - a permission the tier already
  // grants is never written here, so this field alone tells you exactly
  // what makes this role different from a plain standard tier.
  permissionOverrides: Partial<RolePermissions>;
  createdAt: Date;
  updatedAt: Date;
}

const permissionOverridesSchemaFields = Object.fromEntries(
  ALL_PERMISSIONS.map((permission) => [permission, { type: Boolean, required: false }])
);

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Please provide a name for this role."],
    },
    // No longer unique - roles are now named instances of one of five
    // standard tiers (see src/lib/permissions.ts), so two different custom
    // roles can legitimately share a base tier/weight (e.g. two
    // Lab-Technician-tier roles with different extra permissions granted).
    weight: {
      type: Number,
      required: [true, "Please specify the weight for this role"],
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Disabled"],
    },
    // A plain nested object (not wrapped in a `type:`/`default:` shorthand,
    // which Mongoose can't disambiguate from a field literally named
    // "type") - each permission becomes its own optional path under
    // permissionOverrides.*, with no _id since it's not a subdocument array.
    permissionOverrides: permissionOverridesSchemaFields,
  },
  { timestamps: true }
);

export function getRoleModel(connection: Connection): Model<IRole> {
  return (
    (connection.models.Role as Model<IRole>) ||
    connection.model<IRole>("Role", RoleSchema)
  );
}
