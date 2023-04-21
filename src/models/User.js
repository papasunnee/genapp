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
      required: "Email address is required",
      validate: [validateEmail, "Please fill a valid email address"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide password for this user."],
    },
    dob: {
      type: Date,
      required: [true, "Please provide date of birth for this user."],
      max: Date.now(),
    },
    lab_no: {
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

UserSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    bcrypt.hash(this.password, 8, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  }
});

UserSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error("Password is missing");
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    console.log("Error while comparing pasword!", error.message);
  }
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
