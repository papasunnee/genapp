import { Connection, Document, Model, Schema, Types } from "mongoose";

export interface ITestParameter extends Document {
  name: string;
  testType?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TestParameterSchema = new Schema<ITestParameter>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this test type."],
      maxlength: [60, "Test type cannot be more than 60 characters"],
    },
    testType: {
      type: Schema.Types.ObjectId,
      ref: "TestType",
    },
  },
  { timestamps: true }
);

export function getTestParameterModel(
  connection: Connection
): Model<ITestParameter> {
  return (
    (connection.models.TestParameter as Model<ITestParameter>) ||
    connection.model<ITestParameter>("TestParameter", TestParameterSchema)
  );
}
