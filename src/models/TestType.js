import mongoose, { Schema } from "mongoose";

/* TestTypeSchema will correspond to a collection in your MongoDB database. */
const TestTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name for this test type."],
    maxlength: [60, "Test type cannot be more than 60 characters"],
  },
  testCategory: {
    type: Schema.Types.ObjectId,
    ref: "TestCategory",
  },
});

export default mongoose.models.TestType ||
  mongoose.model("TestType", TestTypeSchema);
