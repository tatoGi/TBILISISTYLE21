import type { SoldTicket } from "@/lib/sold-tickets";

export function isJokerTicketName(value: unknown) {
  return typeof value === "string" && value.toLowerCase().includes("joker");
}

export function serializeSoldTicket(ticket: Record<string, unknown>): SoldTicket {
  return {
    id: ticket.id as string,
    personalNumber: ticket.personalNumber as string,
    email: ticket.email as string,
    name: ticket.name as string,
    surname: ticket.surname as string,
    amount: ticket.amount as number,
    status: ticket.status as string,
    originalTicketId: ticket.originalTicketId as string,
    eventName: ticket.eventName as string,
    eventDate: ticket.eventDate as string | Date | undefined,
    location: ticket.location as string | undefined,
    paidAt: ticket.paidAt as string | Date | undefined,
    scannedAt: ticket.scannedAt as string | Date | undefined,
    createdAt: ticket.createdAt as string | Date | undefined,
  };
}
