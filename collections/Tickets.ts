import type { CollectionConfig } from "payload";
import { localeTabsKeepBase } from "../fields/localeTabs";

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
  // NOTE: field names and types must stay in sync with lib/tickets.ts (the
  // payment flow reads them by name). Only presentation (labels, descriptions,
  // positions, row grouping) is safe to change here.
  timestamps: true,
  fields: [
    // Name + description per language (ka tab writes the base `title`/
    // `description` columns the payment flow reads; en/ru/ua add translations).
    localeTabsKeepBase([
      {
        name: "title",
        type: "text",
        required: true,
        label: "Ticket name",
        admin: {
          placeholder: "e.g. General Admission",
          description: "The ticket type shown to customers.",
        },
      },
      {
        name: "description",
        type: "textarea",
        label: "Description",
        admin: {
          placeholder: "What's included with this ticket…",
          description: "Optional details shown on the ticket card.",
        },
      },
    ]),
    {
      type: "row",
      fields: [
        {
          name: "priceGel",
          type: "number",
          required: true,
          min: 0,
          label: "Price (GEL)",
          admin: { width: "50%", placeholder: "0" },
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          min: 0,
          defaultValue: 0,
          label: "Quantity available",
          admin: { width: "50%", placeholder: "0" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "eventDate",
          type: "text",
          label: "Event date",
          admin: { width: "50%", placeholder: "2027-08-27", description: "Format: YYYY-MM-DD." },
        },
        {
          name: "location",
          type: "text",
          label: "Location",
          admin: { width: "50%", placeholder: "e.g. Tbilisi" },
        },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      label: "Status",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Active", value: "active" },
        { label: "Sold out", value: "sold_out" },
      ],
      admin: {
        position: "sidebar",
        description: "Only Active / Sold out tickets appear on the public site.",
      },
    },
    {
      name: "saleUrl",
      type: "text",
      label: "External sale URL",
      admin: {
        position: "sidebar",
        placeholder: "https://…",
        description: "Optional link to an external ticketing page.",
      },
    },
  ],
};
