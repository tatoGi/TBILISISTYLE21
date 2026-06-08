import type { CollectionConfig } from "payload";
import { contentBlocks } from "../blocks/contentBlocks";
import { localeTabs } from "../fields/localeTabs";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Post", plural: "News" },
  admin: {
    useAsTitle: "title_ka",
    defaultColumns: ["title_ka", "slug", "publishedAt", "_status"],
    group: false,
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    // Title + excerpt for all four languages, edited together in tabs.
    localeTabs([
      { name: "title", type: "text", required: true, label: "Title" },
      { name: "excerpt", type: "textarea", label: "Excerpt" },
    ]),
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "URL path → /news/<slug>. Lowercase, no spaces.",
        position: "sidebar",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "featuredOnHome",
      type: "checkbox",
      label: "Feature on homepage",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Show this post in the festival landing news section.",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "layout",
      type: "blocks",
      label: "Content blocks",
      minRows: 1,
      blocks: contentBlocks,
    },
  ],
};
