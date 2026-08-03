import { Connection, Document, Model, Schema, Types } from "mongoose";

export type InvoiceStatus = "Unpaid" | "Paid" | "Void";

export interface IInvoice extends Document {
  invoiceNumber: string;
  test: Types.ObjectId;
  patient: Types.ObjectId;
  amount: number;
  amountPaid: number;
  status: InvoiceStatus;
  voidedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * The billing document a test gets the moment it's ordered - created
 * automatically (see POST /api/diagnosis), not something staff fill in.
 * `amount` is frozen at creation time from the test's cost, so a later
 * test-catalog price change never rewrites a historical invoice.
 */
const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    test: {
      type: Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Unpaid", "Paid", "Void"],
      default: "Unpaid",
    },
    voidedReason: {
      type: String,
      maxlength: [200, "Reason cannot be more than 200 characters"],
    },
  },
  { timestamps: true }
);

export function getInvoiceModel(connection: Connection): Model<IInvoice> {
  return (
    (connection.models.Invoice as Model<IInvoice>) ||
    connection.model<IInvoice>("Invoice", InvoiceSchema)
  );
}
