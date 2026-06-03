import type { CollectionConfig } from "payload";
import { contentBlocks } from "../blocks/contentBlocks";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "showInNav", "navOrder", "_status"],
    group: "Content",
  },
  // Admin list and queries default to menu order.
  defaultSort: "navOrder",
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          "URL path, e.g. \"main-stage\" → /main-stage. Lowercase, no spaces.",
        position: "sidebar",
      },
    },
    {
      name: "showInNav",
      type: "checkbox",
      label: "Show in site menu",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "navOrder",
      type: "number",
      label: "Menu order",
      defaultValue: 100,
      admin: {
        position: "sidebar",
        description: "Lower numbers appear first.",
        condition: (data) => Boolean(data?.showInNav),
      },
    },
    {
      name: "navLabel",
      type: "text",
      label: "Menu label (optional)",
      localized: true,
      admin: {
        position: "sidebar",
        description: "Overrides the page title in the menu.",
        condition: (data) => Boolean(data?.showInNav),
      },
    },
    {
      name: "featuredOnHome",
      type: "checkbox",
      label: "Feature on homepage",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "layout",
      type: "blocks",
      label: "Content blocks",
      minRows: 1,
      blocks: contentBlocks,
    },
    {
      type: "collapsible",
      label: "SEO",
      admin: { initCollapsed: true },
      fields: [
        { name: "metaTitle", type: "text", localized: true },
        { name: "metaDescription", type: "textarea", localized: true },
      ],
    },
  ],
};
