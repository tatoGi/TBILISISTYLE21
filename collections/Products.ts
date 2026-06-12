import type { CollectionConfig } from "payload";
import { localeTabsKeepBase } from "../fields/localeTabs";

// Mirrors the existing native-driver `products` collection (lib/products.ts).
export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "priceGel", "isVip", "status"],
    group: false,
    // Replace the native list with the unified Velzon list (redirects to /admin/products).
    components: {
      views: {
        list: { Component: "/app/(payload)/admin/ProductsCollectionList.tsx" },
      },
    },
  },
  timestamps: true,
  hooks: {
    // Keep `imageUrl` (read by the public storefront via the native driver)
    // in sync with the uploaded media file, so editors upload instead of
    // pasting URLs.
    beforeChange: [
      async ({ data, req }) => {
        if (data?.image) {
          try {
            const id = typeof data.image === "object" ? data.image.id : data.image;
            const media = await req.payload.findByID({
              collection: "media",
              id,
              depth: 0,
            });
            if (media?.url) {
              data.imageUrl = media.url;
            }
          } catch {
            /* leave imageUrl as-is if media lookup fails */
          }
        }
        return data;
      },
    ],
  },
  fields: [
    // Name + description per language (ka tab writes the base `title`/
    // `description` columns the storefront/order flow reads; en/ru/ua add
    // translations).
    localeTabsKeepBase([
      { name: "title", type: "text", required: true, label: "Title" },
      { name: "description", type: "textarea", label: "Description" },
    ]),
    { name: "priceGel", type: "number", required: true, min: 0, label: "Price (GEL)" },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Product image",
      admin: { description: "Upload the product photo." },
    },
    {
      name: "imageUrl",
      type: "text",
      admin: {
        hidden: true,
        readOnly: true,
        description: "Auto-filled from the uploaded image.",
      },
    },
    { name: "category", type: "text" },
    { name: "isVip", type: "checkbox", label: "VIP product", defaultValue: false },
    {
      name: "sizes",
      type: "array",
      minRows: 1,
      labels: { singular: "Size", plural: "Sizes" },
      fields: [
        { name: "size", type: "text", required: true },
        { name: "quantity", type: "number", required: true, min: 0, defaultValue: 0 },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Active", value: "active" },
        { label: "Sold out", value: "sold_out" },
      ],
    },
  ],
};
