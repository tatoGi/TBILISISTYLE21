import type { CollectionConfig } from "payload";
import { localeTabsKeepBase } from "../fields/localeTabs";
import { revalidateMusicTracksCache } from "../lib/cms-revalidate";

export const MusicTracks: CollectionConfig = {
  slug: "musicTracks",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "artist", "status", "order"],
    group: false,
  },
  access: {
    read: () => true,
  },
  defaultSort: "order",
  timestamps: true,
  hooks: {
    afterChange: [() => { revalidateMusicTracksCache(); }],
    afterDelete: [() => { revalidateMusicTracksCache(); }],
  },
  fields: [
    localeTabsKeepBase([
      {
        name: "title",
        type: "text",
        required: true,
        label: "Track title",
      },
    ]),
    {
      name: "artist",
      type: "text",
      label: "Artist",
    },
    {
      name: "audioFile",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Audio file",
      filterOptions: {
        or: [
          { mimeType: { contains: "audio" } },
          { mimeType: { contains: "mpeg" } },
          { mimeType: { equals: "video/mpeg" } },
        ],
      },
      admin: {
        description: "MP3/OGG/WAV/MPEG audio file.",
      },
    },
    {
      name: "order",
      type: "number",
      label: "Sort order",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Lower numbers appear first.",
      },
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
      ],
      admin: {
        position: "sidebar",
        description: "Only Active tracks appear on the public site.",
      },
    },
  ],
};
