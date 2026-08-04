import { Connection, Document, Model, Schema } from "mongoose";

export interface IRateLimitAttempt extends Document {
  key: string;
  createdAt: Date;
}

/**
 * Backs rate limiting on public, unauthenticated-facing endpoints (login,
 * signup, platform login) - lives on the control-plane connection since
 * these checks (especially login) happen before any tenant is resolved.
 * Mongo rather than an in-memory counter because this app runs on
 * serverless (Vercel) - an in-memory map wouldn't be shared across
 * function instances/cold starts, so it'd only catch a fraction of a real
 * attack. A generous fixed TTL cleans up old attempts regardless of
 * whatever window an individual check used.
 */
const RateLimitAttemptSchema = new Schema<IRateLimitAttempt>({
  key: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

RateLimitAttemptSchema.index({ key: 1, createdAt: 1 });
RateLimitAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export function getRateLimitAttemptModel(connection: Connection): Model<IRateLimitAttempt> {
  return (
    (connection.models.RateLimitAttempt as Model<IRateLimitAttempt>) ||
    connection.model<IRateLimitAttempt>("RateLimitAttempt", RateLimitAttemptSchema)
  );
}
