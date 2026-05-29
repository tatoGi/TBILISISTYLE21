import { MongoClient, Collection } from "mongodb";
import dns from "dns";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoDnsConfigured: boolean | undefined;
}

// Workaround for corporate / restricted networks where the system DNS
// resolver refuses Node.js SRV queries (querySrv ECONNREFUSED).
// Set MONGO_DNS_SERVERS="8.8.8.8,1.1.1.1" in .env.local to override.
// Production (Vercel) leaves this empty and uses platform DNS.
if (!global._mongoDnsConfigured && process.env.MONGO_DNS_SERVERS) {
  const servers = process.env.MONGO_DNS_SERVERS
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length) {
    dns.setServers(servers);
  }
  global._mongoDnsConfigured = true;
}

function getClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable.");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }

    return global._mongoClientPromise;
  }

  const client = new MongoClient(uri);
  return client.connect();
}

export async function getDb() {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB || "tbilisistyle21");
}

// 👇 დაამატე ეს ფუნქციები

export async function getTicketsCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection("tickets");
}

export async function getSoldTicketsCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection("soldTickets");
}

export async function getJokerTicketsCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection("jokerTickets");
}

export async function getMessageJobsCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection("messageJobs");
}

export async function getEventsCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection("events");
}
