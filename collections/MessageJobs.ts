import type { CollectionConfig } from "payload";

const isAdmin = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

export const MessageJobs: CollectionConfig = {
  slug: "messageJobs",
  labels: {
    singular: "Email Job",
    plural: "Email Queue",
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "subject", "type", "status", "attempts", "createdAt"],
    group: false,
    description: "Read-only outgoing message queue used by ticket emails.",
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "email", type: "email", admin: { readOnly: true } },
    { name: "subject", type: "text", admin: { readOnly: true } },
    { name: "type", type: "text", admin: { readOnly: true } },
    { name: "status", type: "text", admin: { readOnly: true } },
    { name: "attempts", type: "number", admin: { readOnly: true } },
    { name: "lastError", type: "textarea", admin: { readOnly: true } },
    { name: "ticketId", type: "text", admin: { readOnly: true } },
    { name: "createdAt", type: "date", admin: { readOnly: true } },
    { name: "updatedAt", type: "date", admin: { readOnly: true } },
    { name: "sentAt", type: "date", admin: { readOnly: true } },
    // Full job payload consumed by the email worker (lib/message-broker.ts).
    { name: "payload", type: "json", access: { read: () => false }, admin: { readOnly: true, hidden: true } },
  ],
};
