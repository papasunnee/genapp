import mongoose, { Schema } from "mongoose";
import User from "./User";
import Test from "./Test";

/* PaymentSchema will correspond to a collection in your MongoDB database. */
const PaymentSchema = new mongoose.Schema(
  {
    invoice: {
      type: String,
      required: [true, "Please provide invoice number for this payment."],
      maxlength: [60, "First Name cannot be more than 60 characters"],
    },
    amount_paid: {
      type: Number,
      required: [true, "Please provide amount paid."],
    },
    payment_option: {
      type: String,
      default: "cash",
      enum: ["cash", "card"],
    },
    test: {
      type: Schema.Types.ObjectId,
      ref: "Test",
      required: [true, "Please provide test payment is meant for."],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user who accepted the payment."],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
