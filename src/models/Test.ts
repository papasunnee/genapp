import { Connection, Document, Model, Schema, Types } from "mongoose";

export type TestStatus =
  | "Awaiting Payment"
  | "Awaiting Result"
  | "Test Completed"
  | "Cancelled";

export interface ITest extends Document {
  test_title: string;
  test_data: string;
  specimen?: string;
  clinical_address?: string;
  clinical_diagnosis?: string;
  status: TestStatus;
  patient?: Types.ObjectId;
  user?: Types.ObjectId;
  payment?: Types.ObjectId;
  invoice?: Types.ObjectId;
  total_cost: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestSchema = new Schema<ITest>(
  {
    test_title: {
      type: String,
      required: [true, "Please provide a title for this test."],
      maxlength: [200, "Name cannot be more than 200 characters"],
    },
    test_data: {
      type: String,
      required: [true, "Please provide data for this test"],
    },
    specimen: {
      type: String,
      maxlength: [60, "Specimen cannot be more than 60 characters"],
    },
    clinical_address: {
      type: String,
      maxlength: [
        100,
        "Clinical Address specified cannot be more than 100 characters",
      ],
    },
    clinical_diagnosis: {
      type: String,
      maxlength: [
        100,
        "Clinical Address specified cannot be more than 100 characters",
      ],
    },
    status: {
      type: String,
      default: "Awaiting Payment",
      enum: ["Awaiting Payment", "Awaiting Result", "Test Completed", "Cancelled"],
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
    },
    total_cost: {
      type: Number,
      required: [true, "Cannot Compute Cost of the test"],
    },
  },
  { timestamps: true }
);

export function getTestModel(connection: Connection): Model<ITest> {
  return (
    (connection.models.Test as Model<ITest>) ||
    connection.model<ITest>("Test", TestSchema)
  );
}
