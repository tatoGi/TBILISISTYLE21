import { getPayloadClient } from "./payload";

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

const statuses: TicketStatus[] = ["draft", "active", "sold_out"];

function serializeTicket(ticket: Record<string, unknown>): Ticket {
  return {
    id: String(ticket.id),
    title: (ticket.title as string) ?? "",
    description: (ticket.description as string) ?? "",
    priceGel: Number(ticket.priceGel ?? 0),
    eventDate: (ticket.eventDate as string) ?? "",
    location: (ticket.location as string) ?? "",
    quantity: Number(ticket.quantity ?? 0),
    saleUrl: (ticket.saleUrl as string) ?? "",
    status: (ticket.status as TicketStatus) ?? "draft",
    createdAt: (ticket.createdAt as string) ?? "",
    updatedAt: (ticket.updatedAt as string) ?? "",
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
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "tickets",
    where: publicOnly ? { status: { in: ["active", "sold_out"] } } : {},
    sort: "-createdAt",
    limit: 0,
    pagination: false,
    depth: 0,
  });

  return result.docs.map((d) => serializeTicket(d as unknown as Record<string, unknown>));
}

export async function getTicket(id: string): Promise<Ticket | null> {
  if (!id) return null;
  const payload = await getPayloadClient();
  try {
    const ticket = await payload.findByID({ collection: "tickets", id, depth: 0 });
    return ticket ? serializeTicket(ticket as unknown as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function createTicket(input: TicketInput) {
  const payload = await getPayloadClient();
  const ticket = await payload.create({
    collection: "tickets",
    data: input,
  });
  return String(ticket.id);
}

export async function updateTicket(id: string, input: TicketInput) {
  const payload = await getPayloadClient();
  await payload.update({ collection: "tickets", id, data: input });
}

export async function deleteTicket(id: string) {
  const payload = await getPayloadClient();
  await payload.delete({ collection: "tickets", id });
}
