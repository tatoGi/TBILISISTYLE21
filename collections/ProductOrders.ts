import type { CollectionConfig } from "payload";

export const ProductOrders: CollectionConfig = {
  slug: "productOrders",
  labels: {
    singular: "Product Order",
    plural: "Product Orders",
  },
  admin: {
    useAsTitle: "productTitle",
    defaultColumns: ["productTitle", "size", "name", "email", "status", "paidAt"],
    group: "Orders",
    description: "Read-only merch orders created by the product payment flow.",
  },
  access: {
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "id", type: "text", label: "Order ID", admin: { readOnly: true } },
    { name: "productId", type: "text", admin: { readOnly: true } },
    { name: "productTitle", type: "text", admin: { readOnly: true } },
    { name: "size", type: "text", admin: { readOnly: true } },
    { name: "name", type: "text", admin: { readOnly: true } },
    { name: "email", type: "email", admin: { readOnly: true } },
    { name: "phone", type: "text", admin: { readOnly: true } },
    { name: "amount", type: "number", admin: { readOnly: true } },
    {
      name: "status",
      type: "select",
      admin: { readOnly: true },
      options: [
        { label: "Pending", value: "pending" },
        { label: "Paid", value: "paid" },
        { label: "Collected", value: "collected" },
        { label: "Failed", value: "failed" },
      ],
    },
    { name: "qrCode", type: "text", admin: { readOnly: true } },
    { name: "createdAt", type: "date", admin: { readOnly: true } },
    { name: "paidAt", type: "date", admin: { readOnly: true } },
    { name: "collectedAt", type: "date", admin: { readOnly: true } },
    // Payment-flow internals (written by the create-product-order / pg-product-callback routes).
    { name: "pgOrderId", type: "number", admin: { readOnly: true, description: "Payment gateway order id." } },
    { name: "pgPassword", type: "text", admin: { readOnly: true, hidden: true } },
    { name: "failedAt", type: "date", admin: { readOnly: true } },
    { name: "failReason", type: "text", admin: { readOnly: true } },
  ],
};
