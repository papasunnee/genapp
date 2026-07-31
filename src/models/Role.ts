import { Connection, Document, Model, Schema } from "mongoose";

export interface IRole extends Document {
  name: string;
  weight: number;
  status: "Active" | "Disabled";
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Please provide a name for this role."],
    },
    weight: {
      type: Number,
      unique: true,
      required: [true, "Please specify the weight for this role"],
      maxlength: [40, "Species specified cannot be more than 40 characters"],
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Disabled"],
    },
  },
  { timestamps: true }
);

export function getRoleModel(connection: Connection): Model<IRole> {
  return (
    (connection.models.Role as Model<IRole>) ||
    connection.model<IRole>("Role", RoleSchema)
  );
}
