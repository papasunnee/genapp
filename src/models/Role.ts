import mongoose, { Document, Model, Schema } from "mongoose";

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

export default (mongoose.models.Role as Model<IRole>) ||
  mongoose.model<IRole>("Role", RoleSchema);
