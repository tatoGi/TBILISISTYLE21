import { MongoClient, Collection } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
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

export async function getEventsCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection("events");
}