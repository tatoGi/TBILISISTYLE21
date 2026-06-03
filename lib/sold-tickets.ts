import type { Where } from "payload";
import { getPayloadClient } from "@/lib/payload";
import { isJokerTicketName, serializeSoldTicket } from "@/lib/ticket-utils";

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

export { isJokerTicketName };

export async function listSoldTickets(where: Where = {}) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "soldTickets",
    where,
    sort: ["-paidAt", "-createdAt"],
    limit: 0,
    pagination: false,
    depth: 0,
  });

  return result.docs.map((d) => serializeSoldTicket(d as unknown as Record<string, unknown>));
}

export async function listJokerTickets() {
  // Read from soldTickets so all paid joker purchases show up, regardless of
  // whether the jokerTickets denormalized mirror was populated.
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "soldTickets",
    where: {
      status: { equals: "paid" },
      eventName: { like: "joker" },
    },
    sort: ["-paidAt", "-createdAt"],
    limit: 0,
    pagination: false,
    depth: 0,
  });

  return result.docs.map((d) => serializeSoldTicket(d as unknown as Record<string, unknown>));
}

export async function upsertJokerTicket(ticket: Record<string, unknown>) {
  const payload = await getPayloadClient();
  const id = ticket.id as string;
  if (!id) return;

  const data = {
    id,
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
  } as Record<string, unknown>;

  let exists = false;
  try {
    await payload.findByID({ collection: "jokerTickets", id, depth: 0 });
    exists = true;
  } catch {
    exists = false;
  }

  if (exists) {
    await payload.update({ collection: "jokerTickets", id, data });
  } else {
    await payload.create({ collection: "jokerTickets", data });
  }
}
