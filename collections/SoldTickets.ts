import type { CollectionConfig } from "payload";

export const SoldTickets: CollectionConfig = {
  slug: "soldTickets",
  labels: {
    singular: "Sold Ticket",
    plural: "Sold Tickets",
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["eventName", "name", "surname", "email", "status", "paidAt"],
    group: false,
    description: "Read-only ticket purchases created by the payment flow.",
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
    {
      name: "status",
      type: "select",
      admin: { readOnly: true },
      options: [
        { label: "Pending", value: "pending" },
        { label: "Paid", value: "paid" },
        { label: "Failed", value: "failed" },
        { label: "Scanned", value: "scanned" },
      ],
    },
    { name: "originalTicketId", type: "text", admin: { readOnly: true } },
    { name: "eventName", type: "text", admin: { readOnly: true } },
    { name: "eventDate", type: "date", admin: { readOnly: true } },
    { name: "location", type: "text", admin: { readOnly: true } },
    { name: "paidAt", type: "date", admin: { readOnly: true } },
    { name: "scannedAt", type: "date", admin: { readOnly: true } },
    { name: "scannedBy", type: "text", admin: { readOnly: true } },
    { name: "createdAt", type: "date", admin: { readOnly: true } },
    // Payment-flow internals (written by the create-order / pg-callback routes).
    { name: "pgOrderId", type: "number", admin: { readOnly: true, description: "Payment gateway order id." } },
    { name: "pgPassword", type: "text", admin: { readOnly: true, hidden: true } },
    { name: "qrCode", type: "textarea", admin: { readOnly: true, hidden: true } },
    { name: "failedAt", type: "date", admin: { readOnly: true } },
    { name: "failReason", type: "text", admin: { readOnly: true } },
  ],
};
