import { Connection, Document, Model, Schema } from "mongoose";

export interface ITestCategory extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestCategorySchema = new Schema<ITestCategory>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this test category."],
      maxlength: [60, "Test category name cannot be more than 60 characters"],
    },
  },
  { timestamps: true }
);

export function getTestCategoryModel(
  connection: Connection
): Model<ITestCategory> {
  return (
    (connection.models.TestCategory as Model<ITestCategory>) ||
    connection.model<ITestCategory>("TestCategory", TestCategorySchema)
  );
}
