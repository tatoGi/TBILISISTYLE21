import type { Document, Filter } from "mongodb";
import {
  getJokerTicketsCollection,
  getSoldTicketsCollection,
} from "@/lib/mongodb";

export type SoldTicket = {
  id: string;
  personalNumber: string;
  email: string;
  name: string;
  surname: string;
  amount: number;
  status: string;
  originalTicketId: string;
  eventName: string;
  eventDate?: string | Date;
  location?: string;
  paidAt?: string | Date;
  scannedAt?: string | Date;
  createdAt?: string | Date;
};

function serializeSoldTicket(ticket: Document): SoldTicket {
  return {
    id: ticket.id,
    personalNumber: ticket.personalNumber,
    email: ticket.email,
    name: ticket.name,
    surname: ticket.surname,
    amount: ticket.amount,
    status: ticket.status,
    originalTicketId: ticket.originalTicketId,
    eventName: ticket.eventName,
    eventDate: ticket.eventDate,
    location: ticket.location,
    paidAt: ticket.paidAt,
    scannedAt: ticket.scannedAt,
    createdAt: ticket.createdAt,
  };
}

export function isJokerTicketName(value: unknown) {
  return typeof value === "string" && value.toLowerCase().includes("joker");
}

export async function listSoldTickets(filter: Filter<Document> = {}) {
  const collection = await getSoldTicketsCollection();
  const tickets = await collection
    .find(filter)
    .sort({ paidAt: -1, createdAt: -1 })
    .toArray();

  return tickets.map(serializeSoldTicket);
}

export async function listJokerTickets() {
  const collection = await getJokerTicketsCollection();
  const tickets = await collection
    .find({})
    .sort({ paidAt: -1, createdAt: -1 })
    .toArray();

  return tickets.map(serializeSoldTicket);
}

export async function upsertJokerTicket(ticket: Document) {
  const collection = await getJokerTicketsCollection();

  await collection.updateOne(
    { id: ticket.id },
    {
      $set: {
        id: ticket.id,
        personalNumber: ticket.personalNumber,
        email: ticket.email,
        name: ticket.name,
        surname: ticket.surname,
        amount: ticket.amount,
        status: ticket.status,
        originalTicketId: ticket.originalTicketId,
        eventName: ticket.eventName,
        eventDate: ticket.eventDate,
        location: ticket.location,
        paidAt: ticket.paidAt,
        scannedAt: ticket.scannedAt,
        createdAt: ticket.createdAt,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}
