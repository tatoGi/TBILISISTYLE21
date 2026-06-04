import type { CollectionConfig } from "payload";

export const JokerTickets: CollectionConfig = {
  slug: "jokerTickets",
  labels: {
    singular: "Joker Ticket",
    plural: "Joker Tickets",
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["eventName", "name", "surname", "email", "status", "paidAt"],
    group: false,
    description: "Read-only mirror of paid Joker ticket purchases.",
  },
  access: {
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "id", type: "text", label: "Ticket ID", admin: { readOnly: true } },
    { name: "personalNumber", type: "text", admin: { readOnly: true } },
    { name: "email", type: "email", admin: { readOnly: true } },
    { name: "name", type: "text", admin: { readOnly: true } },
    { name: "surname", type: "text", admin: { readOnly: true } },
    { name: "amount", type: "number", admin: { readOnly: true } },
    { name: "status", type: "text", admin: { readOnly: true } },
    { name: "originalTicketId", type: "text", admin: { readOnly: true } },
    { name: "eventName", type: "text", admin: { readOnly: true } },
    { name: "eventDate", type: "date", admin: { readOnly: true } },
    { name: "location", type: "text", admin: { readOnly: true } },
    { name: "paidAt", type: "date", admin: { readOnly: true } },
    { name: "scannedAt", type: "date", admin: { readOnly: true } },
    { name: "createdAt", type: "date", admin: { readOnly: true } },
  ],
};
