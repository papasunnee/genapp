import mongoose, { Schema } from "mongoose";

/* TestParameterSchema will correspond to a collection in your MongoDB database. */
const TestParameterSchema = new mongoose.Schema(
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

export default mongoose.models.TestParameter ||
  mongoose.model("TestParameter", TestParameterSchema);
