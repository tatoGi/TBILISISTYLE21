/**
 * One-shot data migration: MongoDB (native-driver collections) -> PostgreSQL (Payload).
 *
 * Migrates the transactional app data that previously lived in the raw Mongo
 * collections. CMS content (pages/posts/media/users) is NOT migrated here —
 * recreate it in the new admin or via scripts/seed-pages.ts.
 *
 * Source connection (does NOT reuse the app's MONGODB_URI, to avoid pointing at
 * the new empty DB by accident):
 *   MIGRATE_MONGODB_URI   required, e.g. mongodb+srv://user:pass@cluster/...
 *   MIGRATE_MONGODB_DB    optional, defaults to "tbilisistyle21"
 *   MIGRATE_WIPE          optional, "true" to delete existing Postgres rows first
 *
 * Destination: the Payload Postgres adapter configured via DATABASE_URL.
 *
 * Run:  npx payload run scripts/migrate-mongo-to-postgres.ts
 */
import dns from "dns";
import { MongoClient, type Document } from "mongodb";
import { getPayload } from "payload";
import config from "@payload-config";

// Some networks can't resolve Atlas SRV records via the system resolver.
// Set MIGRATE_MONGO_DNS_SERVERS="8.8.8.8,1.1.1.1" to override.
const dnsServers = (process.env.MIGRATE_MONGO_DNS_SERVERS || process.env.MONGO_DNS_SERVERS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
if (dnsServers.length) dns.setServers(dnsServers);

const SRC_URI = process.env.MIGRATE_MONGODB_URI;
const SRC_DB = process.env.MIGRATE_MONGODB_DB || "tbilisistyle21";
const WIPE = process.env.MIGRATE_WIPE === "true";

function toIso(value: unknown): string | undefined {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function toDateOrNull(value: unknown): string | null {
  return toIso(value) ?? null;
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value ?? "0"));
  return Number.isFinite(n) ? n : 0;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

async function main() {
  if (!SRC_URI) {
    throw new Error("Set MIGRATE_MONGODB_URI to the source MongoDB connection string.");
  }

  console.error("[migrate] booting Payload…");
  const payload = await getPayload({ config });
  console.error("[migrate] connecting to source Mongo…");
  const mongo = new MongoClient(SRC_URI, { serverSelectionTimeoutMS: 15000 });
  await mongo.connect();
  const db = mongo.db(SRC_DB);
  console.error(`[migrate] connected to source db "${SRC_DB}"`);

  const counts: Record<string, number> = {};
  const bump = (k: string) => (counts[k] = (counts[k] ?? 0) + 1);

  if (WIPE) {
    for (const slug of [
      "messageJobs",
      "productOrders",
      "jokerTickets",
      "soldTickets",
      "products",
      "tickets",
    ] as const) {
      await payload.delete({ collection: slug, where: { id: { exists: true } } });
      payload.logger.info(`Wiped ${slug}`);
    }
  }

  // --- tickets (new uuid PK; remember old _id -> new id for relinking) ---
  const ticketIdMap = new Map<string, string>();
  for (const t of await db.collection("tickets").find().toArray()) {
    const created = await payload.create({
      collection: "tickets",
      data: {
        title: str(t.title) || "Untitled",
        description: str(t.description),
        priceGel: num(t.priceGel),
        eventDate: str(t.eventDate),
        location: str(t.location),
        quantity: Math.max(0, Math.floor(num(t.quantity))),
        saleUrl: str(t.saleUrl),
        status: (["draft", "active", "sold_out"].includes(t.status) ? t.status : "draft") as
          | "draft"
          | "active"
          | "sold_out",
        createdAt: toIso(t.createdAt),
      },
    });
    ticketIdMap.set(String(t._id), String(created.id));
    bump("tickets");
  }

  // --- products (new uuid PK; remember old _id -> new id) ---
  const productIdMap = new Map<string, string>();
  for (const p of await db.collection("products").find().toArray()) {
    const sizes = Array.isArray(p.sizes)
      ? p.sizes.map((s: Document) => ({ size: str(s.size).toUpperCase(), quantity: Math.max(0, Math.floor(num(s.quantity))) }))
      : [];
    const created = await payload.create({
      collection: "products",
      data: {
        title: str(p.title) || "Untitled",
        description: str(p.description),
        priceGel: num(p.priceGel),
        imageUrl: str(p.imageUrl),
        category: str(p.category),
        isVip: Boolean(p.isVip),
        sizes,
        status: (["draft", "active", "sold_out"].includes(p.status) ? p.status : "draft") as
          | "draft"
          | "active"
          | "sold_out",
        createdAt: toIso(p.createdAt),
      },
    });
    productIdMap.set(String(p._id), String(created.id));
    bump("products");
  }

  // --- soldTickets (preserve custom text id; relink originalTicketId) ---
  for (const s of await db.collection("soldTickets").find().toArray()) {
    const originalRef = str(s.originalTicketId);
    const originalTicketId =
      (s.originalTicketObjectId && ticketIdMap.get(String(s.originalTicketObjectId))) ||
      ticketIdMap.get(originalRef) ||
      originalRef;
    await payload.create({
      collection: "soldTickets",
      data: {
        id: str(s.id),
        personalNumber: str(s.personalNumber),
        email: str(s.email),
        name: str(s.name),
        surname: str(s.surname),
        amount: num(s.amount),
        status: (str(s.status) || "pending") as "pending" | "paid" | "failed" | "scanned",
        originalTicketId,
        eventName: str(s.eventName),
        eventDate: toDateOrNull(s.eventDate),
        location: str(s.location),
        paidAt: toDateOrNull(s.paidAt),
        scannedAt: toDateOrNull(s.scannedAt),
        scannedBy: str(s.scannedBy) || undefined,
        pgOrderId: s.pgOrderId != null ? num(s.pgOrderId) : undefined,
        pgPassword: str(s.pgPassword) || undefined,
        qrCode: str(s.qrCode) || undefined,
        failedAt: toDateOrNull(s.failedAt),
        failReason: str(s.failReason) || undefined,
        createdAt: toIso(s.createdAt),
      },
    });
    bump("soldTickets");
  }

  // --- jokerTickets (preserve custom text id) ---
  for (const j of await db.collection("jokerTickets").find().toArray()) {
    await payload.create({
      collection: "jokerTickets",
      data: {
        id: str(j.id),
        personalNumber: str(j.personalNumber),
        email: str(j.email),
        name: str(j.name),
        surname: str(j.surname),
        amount: num(j.amount),
        status: str(j.status) || "paid",
        originalTicketId: ticketIdMap.get(str(j.originalTicketId)) || str(j.originalTicketId),
        eventName: str(j.eventName),
        eventDate: toDateOrNull(j.eventDate),
        location: str(j.location),
        paidAt: toDateOrNull(j.paidAt),
        scannedAt: toDateOrNull(j.scannedAt),
        createdAt: toIso(j.createdAt),
      },
    });
    bump("jokerTickets");
  }

  // --- productOrders (preserve custom text id; relink productId) ---
  for (const o of await db.collection("productOrders").find().toArray()) {
    const productRef = str(o.productId);
    const productId =
      (o.productObjectId && productIdMap.get(String(o.productObjectId))) ||
      productIdMap.get(productRef) ||
      productRef;
    await payload.create({
      collection: "productOrders",
      data: {
        id: str(o.id),
        productId,
        productTitle: str(o.productTitle),
        size: str(o.size),
        name: str(o.name),
        email: str(o.email),
        phone: str(o.phone),
        amount: num(o.amount),
        status: (str(o.status) || "pending") as "pending" | "paid" | "collected" | "failed",
        qrCode: str(o.qrCode) || undefined,
        pgOrderId: o.pgOrderId != null ? num(o.pgOrderId) : undefined,
        pgPassword: str(o.pgPassword) || undefined,
        failedAt: toDateOrNull(o.failedAt),
        failReason: str(o.failReason) || undefined,
        createdAt: toIso(o.createdAt),
        paidAt: toDateOrNull(o.paidAt),
        collectedAt: toDateOrNull(o.collectedAt),
      },
    });
    bump("productOrders");
  }

  // --- messageJobs (new uuid PK; keep nested payload + flat columns) ---
  for (const m of await db.collection("messageJobs").find().toArray()) {
    const jobPayload = (m.payload ?? {}) as Document;
    await payload.create({
      collection: "messageJobs",
      data: {
        type: str(m.type) || "ticket-email",
        status: str(m.status) || "pending",
        attempts: Math.max(0, Math.floor(num(m.attempts))),
        lastError: str(m.lastError) || undefined,
        ticketId: str(jobPayload.ticketId ?? m.ticketId) || undefined,
        email: str(jobPayload.email ?? m.email) || undefined,
        subject: str(m.subject) || (jobPayload.eventName ? `Your ticket — ${jobPayload.eventName}` : undefined),
        payload: jobPayload,
        createdAt: toIso(m.createdAt),
        sentAt: toIso(m.sentAt),
      },
    });
    bump("messageJobs");
  }

  await mongo.close();
  console.error(`[migrate] complete: ${JSON.stringify(counts)}`);
}

// Top-level await so `payload run` waits for the migration to finish before exiting.
try {
  await main();
} catch (err) {
  console.error("Migration failed:", err);
  process.exitCode = 1;
}
