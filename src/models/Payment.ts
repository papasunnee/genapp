import mongoose, { Document, Model, Schema, Types } from "mongoose";
import "./User";
import "./Test";

export interface IPayment extends Document {
  invoice: string;
  amount_paid: number;
  payment_option: "cash" | "card";
  test: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
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

export default (mongoose.models.Payment as Model<IPayment>) ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
