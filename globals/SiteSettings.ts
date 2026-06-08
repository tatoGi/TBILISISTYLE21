import type { GlobalConfig } from "payload";
import { localeTabs } from "../fields/localeTabs";

// "Menu" screen — drag-sortable list of pages that drives the site navigation.
// (Homepage featured pages are controlled by the "Feature on homepage"
// checkbox on each Page.)
export const SiteSettings: GlobalConfig = {
  slug: "site",
  label: "Menu",
  admin: { group: false },
  access: { read: () => true },
  fields: [
    {
      name: "menu",
      type: "array",
      label: "Site menu — drag to reorder",
      labels: { singular: "Menu item", plural: "Menu items" },
      fields: [
        { name: "page", type: "relationship", relationTo: "pages", required: true },
        // Optional per-language label override, edited together in tabs.
        localeTabs([{ name: "label", type: "text", label: "Menu label (optional)" }]),
      ],
    },
  ],
};
