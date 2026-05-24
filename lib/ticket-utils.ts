import type { Document } from "mongodb";
import type { SoldTicket } from "@/lib/sold-tickets";

export function isJokerTicketName(value: unknown) {
  return typeof value === "string" && value.toLowerCase().includes("joker");
}

export function serializeSoldTicket(ticket: Document): SoldTicket {
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
