import dns from "dns";
import mongoose from "mongoose";

// mongodb+srv:// connection strings resolve a DNS SRV record before ever
// touching MongoDB - and on Windows/some ISPs/VPNs, the OS-configured
// resolver handles plain A-record lookups fine but times out on SRV
// queries specifically ("querySrv ETIMEOUT"), which is otherwise
// indistinguishable from a real Atlas outage. Point Node at public
// resolvers that reliably support SRV instead of trusting whatever the
// machine happens to have configured.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

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

/**
 * A single SRV/connection timeout is often transient (the resolver hiccup
 * above, or a brief network blip) rather than a real outage - a couple of
 * quick retries clears most of them instead of failing the whole request.
 */
async function connectWithRetry(dbName: string, attempts = 3): Promise<mongoose.Connection> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await mongoose
        .createConnection(buildUri(dbName), { bufferCommands: false })
        .asPromise();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      }
    }
  }
  throw lastError;
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
    entry.promise = connectWithRetry(dbName);
  }

  try {
    entry.conn = await entry.promise;
  } catch (e) {
    entry.promise = null;
    throw e;
  }

  return entry.conn;
}
