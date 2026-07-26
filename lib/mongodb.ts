import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

// Strip tlsInsecure=true if it crept into the URI — never disable TLS verification.
// The correct fix for self-signed certs is to provide the CA cert via tlsCAFile option.
const rawUri = process.env.MONGODB_URI;
const uri = rawUri.replace(/[&?]tlsInsecure=true/gi, "");

const options = {
  // Keep TLS on (default). If you need to trust a custom CA, uncomment and set the path:
  // tlsCAFile: process.env.MONGODB_TLS_CA_FILE,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable so the MongoClient is
  // preserved across hot-reloads (avoids exhausting connection pool).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, a module-level singleton is fine.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

/**
 * Get the configured database instance.
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || "amal-attendance");
}
