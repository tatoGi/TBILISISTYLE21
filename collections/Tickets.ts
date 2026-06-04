import type { CollectionConfig } from "payload";

// Mirrors the existing native-driver `tickets` collection (lib/tickets.ts).
// Payload manages the catalog in admin; the payment flow keeps reading/writing
// the same Mongo collection via the native driver.
export const Tickets: CollectionConfig = {
  slug: "tickets",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "priceGel", "quantity", "status"],
    group: false,
  },
  // Catalog is admin-managed only; public site reads via the native driver.
  timestamps: true,
  fields: [
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "priceGel", type: "number", required: true, min: 0, label: "Price (GEL)" },
    { name: "eventDate", type: "text", admin: { description: "e.g. 2027-08-27" } },
    { name: "location", type: "text" },
    { name: "quantity", type: "number", required: true, min: 0, defaultValue: 0 },
    { name: "saleUrl", type: "text" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Active", value: "active" },
        { label: "Sold out", value: "sold_out" },
      ],
    },
  ],
};
