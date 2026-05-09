import { ObjectId, type Document } from "mongodb";
import { getDb } from "./mongodb";

export type TicketStatus = "draft" | "active" | "sold_out";

export type Ticket = {
  id: string;
  title: string;
  description: string;
  priceGel: number;
  eventDate: string;
  location: string;
  quantity: number;
  saleUrl: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
};

export type TicketInput = {
  title: string;
  description: string;
  priceGel: number;
  eventDate: string;
  location: string;
  quantity: number;
  saleUrl: string;
  status: TicketStatus;
};

const collectionName = "tickets";
const statuses: TicketStatus[] = ["draft", "active", "sold_out"];

function ticketsCollection() {
  return getDb().then((db) => db.collection(collectionName));
}

function serializeTicket(ticket: Document): Ticket {
  return {
    id: ticket._id.toString(),
    title: ticket.title,
    description: ticket.description,
    priceGel: ticket.priceGel,
    eventDate: ticket.eventDate,
    location: ticket.location,
    quantity: ticket.quantity,
    saleUrl: ticket.saleUrl,
    status: ticket.status,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(value: unknown) {
  const numberValue =
    typeof value === "number" ? value : Number.parseFloat(String(value || "0"));
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export function validateTicketInput(input: Record<string, unknown>): TicketInput {
  const status = getString(input.status) as TicketStatus;
  const ticket = {
    title: getString(input.title),
    description: getString(input.description),
    priceGel: getNumber(input.priceGel),
    eventDate: getString(input.eventDate),
    location: getString(input.location),
    quantity: Math.max(0, Math.floor(getNumber(input.quantity))),
    saleUrl: getString(input.saleUrl),
    status: statuses.includes(status) ? status : "draft",
  };

  if (!ticket.title) {
    throw new Error("Ticket title is required.");
  }

  if (ticket.priceGel < 0) {
    throw new Error("Ticket price cannot be negative.");
  }

  return ticket;
}

export async function listTickets({ publicOnly = false } = {}) {
  const collection = await ticketsCollection();
  const query = publicOnly ? { status: { $in: ["active", "sold_out"] } } : {};
  const tickets = await collection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return tickets.map(serializeTicket);
}

export async function createTicket(input: TicketInput) {
  const now = new Date().toISOString();
  const collection = await ticketsCollection();
  const result = await collection.insertOne({
    ...input,
    createdAt: now,
    updatedAt: now,
  });

  return result.insertedId.toString();
}

export async function updateTicket(id: string, input: TicketInput) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ticket id.");
  }

  const collection = await ticketsCollection();
  await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...input,
        updatedAt: new Date().toISOString(),
      },
    }
  );
}

export async function deleteTicket(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ticket id.");
  }

  const collection = await ticketsCollection();
  await collection.deleteOne({ _id: new ObjectId(id) });
}
