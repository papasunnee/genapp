import { Connection, Document, Model, Schema } from "mongoose";

export type TestResultType = "numeric" | "text";

export interface ITestCatalogParameter {
  id: string;
  nested: boolean;
  name: string;
  resultType: TestResultType;
  unit: string[];
  range: string;
  value: string;
  checked: boolean;
  cost: number;
}

export interface ITestCatalogType {
  name: string;
  parameters: ITestCatalogParameter[];
}

export interface ITestCategory extends Document {
  name: string;
  discrete: boolean;
  nest: 0 | 1 | 2;
  type?: ITestCatalogType[];
  parameters?: ITestCatalogParameter[];
  createdAt: Date;
  updatedAt: Date;
}

const TestCatalogParameterSchema = new Schema<ITestCatalogParameter>(
  {
    id: { type: String, required: true },
    nested: { type: Boolean, default: false },
    name: { type: String, required: true },
    resultType: { type: String, enum: ["numeric", "text"], default: "numeric" },
    unit: { type: [String], default: [] },
    range: { type: String, default: "" },
    value: { type: String, default: "" },
    checked: { type: Boolean, default: false },
    cost: { type: Number, default: 0 },
  },
  { _id: false }
);

const TestCatalogTypeSchema = new Schema<ITestCatalogType>(
  {
    name: { type: String, required: true },
    parameters: { type: [TestCatalogParameterSchema], default: [] },
  },
  { _id: false }
);

const TestCategorySchema = new Schema<ITestCategory>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this test category."],
      maxlength: [60, "Test category name cannot be more than 60 characters"],
    },
    discrete: { type: Boolean, default: false },
    nest: { type: Number, enum: [0, 1, 2], required: true },
    type: { type: [TestCatalogTypeSchema], default: undefined },
    parameters: { type: [TestCatalogParameterSchema], default: undefined },
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
