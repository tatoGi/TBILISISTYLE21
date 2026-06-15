import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    group: false,
  },
  access: {
    // Users can only read their own record; admin panel auth handles the rest.
    read: ({ req }) => {
      if (!req.user) return false;
      return { id: { equals: req.user.id } };
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false;
      return { id: { equals: req.user.id } };
    },
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
