import mongoose, { Document, Model, Schema, Types } from "mongoose";
import "./TestCategory";

export interface ITestType extends Document {
  name: string;
  testCategory?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TestTypeSchema = new Schema<ITestType>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this test type."],
      maxlength: [60, "Test type cannot be more than 60 characters"],
    },
    testCategory: {
      type: Schema.Types.ObjectId,
      ref: "TestCategory",
    },
  },
  { timestamps: true }
);

export default (mongoose.models.TestType as Model<ITestType>) ||
  mongoose.model<ITestType>("TestType", TestTypeSchema);
