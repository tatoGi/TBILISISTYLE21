import type { Block } from "payload";
import { localeTabs } from "../fields/localeTabs";

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Heroes" },
  fields: [
    localeTabs([
      { name: "heading", type: "text", required: true, label: "Heading" },
      { name: "subheading", type: "textarea", label: "Subheading" },
      { name: "ctaLabel", type: "text", label: "Button label" },
    ]),
    { name: "image", type: "upload", relationTo: "media" },
    { name: "ctaHref", type: "text" },
  ],
};

export const RichTextBlock: Block = {
  slug: "richText",
  labels: { singular: "Text", plural: "Text blocks" },
  fields: [
    localeTabs([{ name: "content", type: "richText", required: true, label: "Content" }]),
  ],
};

export const ImageBlock: Block = {
  slug: "image",
  labels: { singular: "Image", plural: "Images" },
  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true },
    localeTabs([{ name: "caption", type: "text", label: "Caption" }]),
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
        localeTabs([{ name: "caption", type: "text", label: "Caption" }]),
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
    localeTabs([{ name: "label", type: "text", required: true, label: "Button label" }]),
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
