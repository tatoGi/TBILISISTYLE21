import type { CollectionConfig } from "payload";
import { contentBlocks } from "../blocks/contentBlocks";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Post", plural: "News" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "publishedAt", "_status"],
    group: false,
  },
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
      name: "excerpt",
      type: "textarea",
      localized: true,
      admin: { description: "Short summary shown in the news list." },
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
