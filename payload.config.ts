import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { buildConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { postgresAdapter } from "@payloadcms/db-postgres";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Posts } from "./collections/Posts";
import { Tickets } from "./collections/Tickets";
import { Products } from "./collections/Products";
import { SoldTickets } from "./collections/SoldTickets";
import { ProductOrders } from "./collections/ProductOrders";
import { JokerTickets } from "./collections/JokerTickets";
import { MessageJobs } from "./collections/MessageJobs";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  routes: {
    admin: "/admin",
    api: "/payload-api",
  },
  admin: {
    user: Users.slug,
    theme: "light",
    meta: {
      titleSuffix: " · TS21 Admin",
      icons: [{ rel: "icon", type: "image/jpeg", url: "/images/logo2.jpeg" }],
    },
    autoLogin: {
      email: process.env.PAYLOAD_ADMIN_EMAIL || "tato.laperashvili95@gmail.com",
    },
    components: {
      graphics: {
        Logo: "/app/(payload)/admin/graphics/Logo.tsx",
        Icon: "/app/(payload)/admin/graphics/Icon.tsx",
      },
      beforeNavLinks: ["/app/(payload)/admin/NavBrand.tsx"],
      views: {
        dashboard: {
          Component: "/app/(payload)/admin/DashboardView.tsx",
        },
        scanner: {
          Component: "/app/(payload)/admin/ScannerView.tsx",
          path: "/scanner",
        },
      },
    },
  },
  editor: lexicalEditor(),
  collections: [
    Pages,
    Posts,
    Tickets,
    Products,
    SoldTickets,
    ProductOrders,
    JokerTickets,
    MessageJobs,
    Media,
    Users,
  ],
  globals: [SiteSettings],
  localization: {
    locales: [
      { label: "ქართული", code: "ka" },
      { label: "English", code: "en" },
      { label: "Русский", code: "ru" },
      { label: "Українська", code: "ua" },
    ],
    defaultLocale: "ka",
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    idType: "uuid",
    pool: {
      // DATABASE_URL for local/dev; POSTGRES_URL is what the Vercel/Neon
      // integration injects (use the pooled connection string in production).
      connectionString:
        process.env.DATABASE_URL || process.env.POSTGRES_URL || "",
    },
  }),
  sharp,
});
