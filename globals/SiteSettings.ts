import type { GlobalConfig } from "payload";

// "Menu" screen — drag-sortable list of pages that drives the site navigation.
// (Homepage featured pages are controlled by the "Feature on homepage"
// checkbox on each Page.)
export const SiteSettings: GlobalConfig = {
  slug: "site",
  label: "Menu",
  admin: { group: "Content" },
  access: { read: () => true },
  fields: [
    {
      name: "menu",
      type: "array",
      label: "Site menu — drag to reorder",
      labels: { singular: "Menu item", plural: "Menu items" },
      fields: [
        { name: "page", type: "relationship", relationTo: "pages", required: true },
        {
          name: "label",
          type: "text",
          localized: true,
          admin: { description: "Optional — overrides the page title in the menu." },
        },
      ],
    },
  ],
};
