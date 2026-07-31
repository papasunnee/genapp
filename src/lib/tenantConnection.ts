import mongoose from "mongoose";

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

if (!DB_USER || !DB_PASSWORD) {
  throw new Error(
    "Please ensure DB_USER and DB_PASSWORD are set in .env.local"
  );
}

function buildUri(dbName: string) {
  return `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.x1q3yzz.mongodb.net/${dbName}?retryWrites=true&w=majority`;
}

interface CachedConnection {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var tenantConnections: Map<string, CachedConnection> | undefined;
}

const cache = global.tenantConnections ?? new Map<string, CachedConnection>();
if (!global.tenantConnections) {
  global.tenantConnections = cache;
}

/**
 * Every tenant (and the control-plane database) gets its own mongoose
 * Connection, cached by database name. Models must be registered on the
 * returned connection (`connection.model(...)`), never on the global
 * `mongoose` singleton - that pattern only supports a single database.
 */
export async function getTenantConnection(
  dbName: string
): Promise<mongoose.Connection> {
  let entry = cache.get(dbName);
  if (!entry) {
    entry = { conn: null, promise: null };
    cache.set(dbName, entry);
  }

  if (entry.conn) {
    return entry.conn;
  }

  if (!entry.promise) {
    entry.promise = mongoose
      .createConnection(buildUri(dbName), { bufferCommands: false })
      .asPromise();
  }

  try {
    entry.conn = await entry.promise;
  } catch (e) {
    entry.promise = null;
    throw e;
  }

  return entry.conn;
}
