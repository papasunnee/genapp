import { Connection, ClientSession } from "mongoose";
import { getCounterModel } from "@/models/Counter";

/**
 * "INV-000001", incrementing per tenant, never reused - the whole point
 * of this being atomic (via $inc) is that it's safe to call from inside
 * a transaction alongside the Test/Invoice creation it's numbering.
 */
export async function nextInvoiceNumber(
  connection: Connection,
  session?: ClientSession
): Promise<string> {
  const Counter = getCounterModel(connection);
  const counter = await Counter.findOneAndUpdate(
    { name: "invoice" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );
  return `INV-${String(counter.seq).padStart(6, "0")}`;
}
