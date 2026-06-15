import type { CollectionConfig } from "payload";
import { localeTabs } from "../fields/localeTabs";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  admin: {
    group: false,
  },
  upload: {
    // Local disk in dev. On Vercel/serverless, swap to a storage adapter
    // (@payloadcms/storage-s3 or storage-vercel-blob) — disk is ephemeral there.
    staticDir: "public/media",
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 768, height: 1024, position: "centre" },
      { name: "hero", width: 1920, height: 1080, position: "centre" },
    ],
    mimeTypes: ["image/*", "video/*", "audio/*"],
  },
  fields: [
    // Alt text for all four languages, edited together in tabs.
    localeTabs([{ name: "alt", type: "text", label: "Alt text" }]),
  ],
};
