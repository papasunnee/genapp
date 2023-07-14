import mongoose, { ConnectOptions } from "mongoose";
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const MONGODB_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.x1q3yzz.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

if (!MONGODB_URI || !DB_NAME || !DB_PASSWORD || !DB_USER) {
  throw new Error(
    "Please ensure you define the following environment variable inside .env.local DB_NAME, DB_PASSWORD, DB_USER"
  );
}

interface connectedOptions extends ConnectOptions {
  bufferCommands: boolean;
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: connectedOptions = {
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
