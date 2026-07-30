import { Connection, Document, Model, Schema, Types } from "mongoose";
import { validateEmail } from "@/utils/validateEmail";

export interface IUser extends Document {
  firstname: string;
  lastname: string;
  email: string;
  dob: Date;
  phone: string;
  lab_no?: string;
  gender?: string;
  image_url?: string;
  role: Types.ObjectId;
  status: "Active" | "Suspended" | "Quit" | "Sacked";
  created_by?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstname: {
      type: String,
      required: [true, "Please provide firstname for this user."],
      maxlength: [60, "First Name cannot be more than 60 characters"],
    },
    lastname: {
      type: String,
      required: [true, "Please provide lastname for this user."],
      maxlength: [60, "First Name cannot be more than 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      validate: [validateEmail, "Please fill a valid email address"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    dob: {
      type: Date,
      required: [true, "Please provide date of birth for this user."],
      max: Date.now(),
    },
    phone: {
      type: String,
      required: [true, "Please provide phone number for this user."],
    },
    lab_no: {
      type: String,
    },
    gender: {
      type: String,
    },
    image_url: {
      type: String,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Suspended", "Quit", "Sacked"],
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export function getUserModel(connection: Connection): Model<IUser> {
  return (
    (connection.models.User as Model<IUser>) ||
    connection.model<IUser>("User", UserSchema)
  );
}
