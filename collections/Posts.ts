import type { CollectionConfig } from "payload";
import { contentBlocks } from "../blocks/contentBlocks";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Post", plural: "News" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "publishedAt", "_status"],
    group: "Content",
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
