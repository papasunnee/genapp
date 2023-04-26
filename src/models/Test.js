import mongoose, { Schema } from "mongoose";

/* TestSchema will correspond to a collection in your MongoDB database. */
const TestSchema = new mongoose.Schema(
  {
    test_title: {
      /* The name of this test */
      type: String,
      required: [true, "Please provide a title for this test."],
      maxlength: [200, "Name cannot be more than 200 characters"],
    },
    test_data: {
      type: String,
      required: [true, "Please provide data for this test"],
    },
    specimen: {
      /* The specimen for the test */
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
      enum: ["Awaiting Payment", "Awaiting Result", "Test Completed"],
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    total_cost: {
      type: Number,
      required: [true, "Cannot Compute Cost of the test"],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Test || mongoose.model("Test", TestSchema);
