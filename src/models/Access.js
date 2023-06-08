import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import User from "./User";
import Role from "./Role";

/* AccessSchema will correspond to a collection in your MongoDB database. */
const AccessSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: [true, "Please provide password for this user."],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user for this password."],
    },
  },
  { timestamps: true }
);

AccessSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    bcrypt.hash(this.password, 8, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  }
});

AccessSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error("Password is missing");
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    console.log("Error while comparing pasword!", error.message);
  }
};

export default mongoose.models.Access || mongoose.model("Access", AccessSchema);
