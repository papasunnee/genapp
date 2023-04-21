import mongoose from "mongoose";

/* TestSchema will correspond to a collection in your MongoDB database. */
const TestSchema = new mongoose.Schema(
  {
    name: {
      /* The name of this test */

      type: String,
      required: [true, "Please provide a name for this test."],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    owner_name: {
      /* The owner of this test */

      type: String,
      required: [true, "Please provide the test owner's name"],
      maxlength: [60, "Owner's Name cannot be more than 60 characters"],
    },
    species: {
      /* The species of your test */

      type: String,
      required: [true, "Please specify the species of your test."],
      maxlength: [40, "Species specified cannot be more than 40 characters"],
    },
    age: {
      /* Test's age, if applicable */

      type: Number,
    },
    poddy_trained: {
      /* Boolean poddy_trained value, if applicable */

      type: Boolean,
    },
    diet: {
      /* List of dietary needs, if applicable */

      type: Array,
    },
    image_url: {
      /* Url to test image */

      required: [true, "Please provide an image url for this test."],
      type: String,
    },
    likes: {
      /* List of things your test likes to do */

      type: Array,
    },
    dislikes: {
      /* List of things your test does not like to do */

      type: Array,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Test || mongoose.model("Test", TestSchema);
