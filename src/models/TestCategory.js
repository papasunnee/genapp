import mongoose from "mongoose";

/* TestCategorySchema will correspond to a collection in your MongoDB database. */
const TestCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this test category."],
      maxlength: [60, "Test category name cannot be more than 60 characters"],
    },
  },
  { timestamps: true }
);

export default mongoose.models.TestCategory ||
  mongoose.model("TestCategory", TestCategorySchema);
