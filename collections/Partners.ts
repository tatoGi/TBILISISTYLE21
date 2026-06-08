import type { CollectionConfig } from "payload";

export const Partners: CollectionConfig = {
  slug: "partners",
  labels: { singular: "Partner", plural: "Partners" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "featuredOnHome", "order"],
    group: false,
    // Replace the native list with the unified Velzon list (redirects to /admin/partners).
    components: {
      views: {
        list: { Component: "/app/(payload)/admin/PartnersCollectionList.tsx" },
      },
    },
  },
  // Admin list and public queries default to menu order.
  defaultSort: "order",
  access: {
    read: () => true,
  },
  fields: [
    {
      // Brand name — intentionally not localized (partner names rarely translate).
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      label: "Short description",
      admin: { description: "One or two sentences shown on the partners page." },
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "website",
      type: "text",
      label: "Website (optional)",
      admin: {
        position: "sidebar",
        description: "Full URL, e.g. https://example.com",
      },
    },
    {
      name: "featuredOnHome",
      type: "checkbox",
      label: "Show on festival landing",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "order",
      type: "number",
      label: "Order",
      defaultValue: 100,
      admin: {
        position: "sidebar",
        description: "Lower numbers appear first.",
      },
    },
  ],
};
