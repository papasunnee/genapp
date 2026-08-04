import { Connection, Document, Model, Schema, Types } from "mongoose";
import { validateEmail } from "@/utils/validateEmail";

export interface IPatientDocument {
  _id?: Types.ObjectId;
  name: string;
  url: string;
  publicId: string;
  resourceType: "image" | "raw";
  uploadedBy?: Types.ObjectId;
  uploadedByLabel?: string;
  uploadedAt: Date;
}

export interface IPatient extends Document {
  firstname: string;
  lastname: string;
  dob: string;
  gender?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  description?: string;
  email: string;
  image_url?: string;
  tests: Types.ObjectId[];
  documents: IPatientDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    firstname: {
      type: String,
      required: [true, "Please provide firstname for this user."],
      maxlength: [60, "First Name cannot be more than 60 characters"],
    },
    lastname: {
      type: String,
      required: [true, "Please provide lastname for this user."],
      maxlength: [60, "Last Name cannot be more than 60 characters"],
    },
    dob: {
      type: String,
      required: [true, "Please provide date of birth for this user."],
    },
    gender: {
      type: String,
    },
    address: {
      type: String,
      required: [true, "Please provide address for this user."],
      maxlength: [100, "Address cannot be more than 60 characters"],
    },
    city: {
      type: String,
      required: [true, "Please provide city for this user."],
      maxlength: [60, "City cannot be more than 60 characters"],
    },
    country: {
      type: String,
      required: [true, "Please provide country for this user."],
      maxlength: [60, "Country cannot be more than 60 characters"],
    },
    phone: {
      type: String,
      required: [true, "Please provide phone number for this user."],
    },
    description: {
      type: String,
      maxlength: [
        250,
        "About me for this user cannot be more than 250 characters",
      ],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      validate: [validateEmail, "Please fill a valid email address"],
    },
    image_url: {
      type: String,
    },
    tests: [
      {
        type: Schema.Types.ObjectId,
        ref: "Test",
      },
    ],
    documents: [
      {
        name: { type: String, required: true, maxlength: 150 },
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        resourceType: { type: String, enum: ["image", "raw"], required: true },
        uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
        uploadedByLabel: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export function getPatientModel(connection: Connection): Model<IPatient> {
  return (
    (connection.models.Patient as Model<IPatient>) ||
    connection.model<IPatient>("Patient", PatientSchema)
  );
}
