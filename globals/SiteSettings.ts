import type { GlobalConfig } from "payload";
import { localeTabs } from "../fields/localeTabs";

// "Menu" screen — drag-sortable list of pages that drives the site navigation.
// (Homepage featured pages are controlled by the "Feature on homepage"
// checkbox on each Page.)
export const SiteSettings: GlobalConfig = {
  slug: "site",
  label: "Site settings",
  admin: {
    group: false,
    description: "Festival landing hero text and the public navigation menu.",
  },
  access: { read: () => true },
  fields: [
    {
      type: "collapsible",
      label: "Festival landing — /dashboard/festival",
      admin: {
        initCollapsed: false,
        description:
          "Centre of the hero (over the background figure): badge, main title and tagline. Leave empty to use the default translations.",
      },
      fields: [
        localeTabs([
          {
            name: "heroBadge",
            type: "text",
            label: "Badge (small line above title)",
          },
          {
            name: "heroTitle",
            type: "text",
            label: "Main title",
          },
          {
            name: "heroTagline",
            type: "text",
            label: "Tagline (below title)",
          },
        ]),
      ],
    },
    {
      type: "collapsible",
      label: "Festival landing — background music",
      admin: {
        initCollapsed: false,
        description:
          "Upload a track to play on /dashboard/festival. Visitors get a play/pause button in the corner of the page.",
      },
      fields: [
        {
          name: "backgroundMusic",
          type: "upload",
          relationTo: "media",
          label: "Music track (audio file)",
          filterOptions: { mimeType: { contains: "audio" } },
          admin: {
            description: "MP3/OGG/WAV. Leave empty to hide the player.",
          },
        },
        {
          name: "musicTitle",
          type: "text",
          label: "Track title (shown next to the player)",
        },
        {
          name: "musicLoop",
          type: "checkbox",
          label: "Loop the track",
          defaultValue: true,
        },
      ],
    },
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
