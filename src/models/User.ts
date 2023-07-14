import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { validateEmail } from "@/utils/validateEmail";
import Role from "./Role";

/* UserSchema will correspond to a collection in your MongoDB database. */
const UserSchema = new mongoose.Schema(
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
      required: [true, "Please provide email for this user."],
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
      // required: [true, "Please provide an image url for this pet."],
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

export default mongoose.models.User || mongoose.model("User", UserSchema);
