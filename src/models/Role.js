import mongoose from "mongoose";

/* RoleSchema will correspond to a collection in your MongoDB database. */
const RoleSchema = new mongoose.Schema(
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

export default mongoose.models.Role || mongoose.model("Role", RoleSchema);
