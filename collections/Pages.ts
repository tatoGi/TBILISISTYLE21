import type { CollectionConfig } from "payload";
import { contentBlocks } from "../blocks/contentBlocks";
import { localeTabs } from "../fields/localeTabs";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title_ka",
    defaultColumns: ["title_ka", "slug", "showInNav", "navOrder", "_status"],
    group: false,
    // Replace the native list with the unified Velzon list (redirects to /admin/pages).
    components: {
      views: {
        list: { Component: "/app/(payload)/admin/PagesCollectionList.tsx" },
      },
    },
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
    // Page title + menu label for all four languages, edited together in tabs.
    localeTabs([
      { name: "title", type: "text", required: true, label: "Title" },
      { name: "navLabel", type: "text", label: "Menu label (optional)" },
    ]),
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
      name: "routePath",
      type: "text",
      label: "Custom route (optional)",
      admin: {
        position: "sidebar",
        description:
          "For pages that live at a fixed React route, e.g. \"/dashboard/shop\". When set, menus link here instead of /{slug}.",
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
        localeTabs([
          { name: "metaTitle", type: "text", label: "Meta title" },
          { name: "metaDescription", type: "textarea", label: "Meta description" },
        ]),
      ],
    },
  ],
};
