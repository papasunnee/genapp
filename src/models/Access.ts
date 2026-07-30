import mongoose, { Document, Model, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import "./User";
import "./Role";

export interface IAccess extends Document {
  password: string;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const AccessSchema = new Schema<IAccess>(
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
    bcrypt.hash(this.password, 8, (err: Error | undefined, hash: string) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  } else {
    next();
  }
});

AccessSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  if (!password) throw new Error("Password is missing");
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error: any) {
    console.log("Error while comparing pasword!", error.message);
    return false;
  }
};

export default (mongoose.models.Access as Model<IAccess>) ||
  mongoose.model<IAccess>("Access", AccessSchema);
