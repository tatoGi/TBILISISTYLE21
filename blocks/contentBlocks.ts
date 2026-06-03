import type { Block } from "payload";

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Heroes" },
  fields: [
    { name: "heading", type: "text", localized: true, required: true },
    { name: "subheading", type: "textarea", localized: true },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "ctaLabel", type: "text", localized: true },
    { name: "ctaHref", type: "text" },
  ],
};

export const RichTextBlock: Block = {
  slug: "richText",
  labels: { singular: "Text", plural: "Text blocks" },
  fields: [
    { name: "content", type: "richText", localized: true, required: true },
  ],
};

export const ImageBlock: Block = {
  slug: "image",
  labels: { singular: "Image", plural: "Images" },
  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true },
    { name: "caption", type: "text", localized: true },
    {
      name: "width",
      type: "select",
      defaultValue: "full",
      options: [
        { label: "Full width", value: "full" },
        { label: "Contained", value: "contained" },
      ],
    },
  ],
};

export const GalleryBlock: Block = {
  slug: "gallery",
  labels: { singular: "Gallery", plural: "Galleries" },
  fields: [
    {
      name: "images",
      type: "array",
      minRows: 1,
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text", localized: true },
      ],
    },
    {
      name: "columns",
      type: "select",
      defaultValue: "3",
      options: [
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" },
      ],
    },
  ],
};

export const CTABlock: Block = {
  slug: "cta",
  labels: { singular: "Call to action", plural: "Calls to action" },
  fields: [
    { name: "label", type: "text", localized: true, required: true },
    { name: "href", type: "text", required: true },
  ],
};

export const contentBlocks = [
  HeroBlock,
  RichTextBlock,
  ImageBlock,
  GalleryBlock,
  CTABlock,
];
