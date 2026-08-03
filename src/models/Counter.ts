import { Connection, Document, Model, Schema } from "mongoose";

export interface ICounter extends Document {
  name: string;
  seq: number;
}

/**
 * Atomic sequence generator (per tenant database, one document per named
 * counter) - backs auto-generated invoice numbers. A plain "count existing
 * docs + 1" would race under concurrent creates; findOneAndUpdate's $inc
 * is atomic at the database level.
 */
const CounterSchema = new Schema<ICounter>({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export function getCounterModel(connection: Connection): Model<ICounter> {
  return (
    (connection.models.Counter as Model<ICounter>) ||
    connection.model<ICounter>("Counter", CounterSchema)
  );
}
