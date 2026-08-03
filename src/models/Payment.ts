import { Connection, Document, Model, Schema, Types } from "mongoose";

export interface IPayment extends Document {
  invoice: Types.ObjectId;
  amount_paid: number;
  payment_option: "cash" | "card";
  test: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    // References the Invoice created automatically when the test was
    // ordered - a payment can never exist without one, so there's nothing
    // for staff to type in here anymore (was a free-text field).
    invoice: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      required: [true, "Please provide the invoice this payment is for."],
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

export function getPaymentModel(connection: Connection): Model<IPayment> {
  return (
    (connection.models.Payment as Model<IPayment>) ||
    connection.model<IPayment>("Payment", PaymentSchema)
  );
}
