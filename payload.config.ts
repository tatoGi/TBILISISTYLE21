import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { buildConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Posts } from "./collections/Posts";
import { Partners } from "./collections/Partners";
import { Tickets } from "./collections/Tickets";
import { Products } from "./collections/Products";
import { SoldTickets } from "./collections/SoldTickets";
import { ProductOrders } from "./collections/ProductOrders";
import { JokerTickets } from "./collections/JokerTickets";
import { MessageJobs } from "./collections/MessageJobs";
import { MusicTracks } from "./collections/MusicTracks";
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
    // SECURITY: autoLogin authenticates every visitor as this user WITHOUT a
    // password (Payload's JWT strategy auto-logs-in when no `prefillOnly` is
    // set), which also makes logout impossible (every request re-authenticates).
    // It is therefore OFF by default and NEVER enabled in production. To use it
    // locally, set PAYLOAD_AUTOLOGIN=true in your dev environment.
    autoLogin:
      process.env.NODE_ENV !== "production" &&
      process.env.PAYLOAD_AUTOLOGIN === "true"
        ? {
            email:
              process.env.PAYLOAD_ADMIN_EMAIL ||
              "tato.laperashvili95@gmail.com",
          }
        : false,
    components: {
      providers: ["/app/(payload)/admin/AdminLoadingProvider.tsx"],
      graphics: {
        Logo: "/app/(payload)/admin/graphics/Logo.tsx",
        Icon: "/app/(payload)/admin/graphics/Icon.tsx",
      },
      beforeNavLinks: ["/app/(payload)/admin/NavBrand.tsx"],
      afterNavLinks: ["/app/(payload)/admin/AdminNavLinks.tsx"],
      views: {
        dashboard: {
          Component: "/app/(payload)/admin/DashboardView.tsx",
        },
        // NOTE: every custom view below sets `exact: true`. Without it Payload's
        // path matcher treats `/products` as a prefix of `/products/new`, so the
        // create/edit routes silently resolve to the list view. Keep it on.
        scanner: {
          Component: "/app/(payload)/admin/ScannerView.tsx",
          exact: true,
          path: "/scanner",
        },
        activity: {
          Component: "/app/(payload)/admin/ActivityView.tsx",
          exact: true,
          path: "/activity",
        },
        settings: {
          Component: "/app/(payload)/admin/SettingsView.tsx",
          exact: true,
          path: "/settings",
        },
        pages: {
          Component: "/app/(payload)/admin/PagesListView.tsx",
          exact: true,
          path: "/pages",
        },
        news: {
          Component: "/app/(payload)/admin/NewsListView.tsx",
          exact: true,
          path: "/news",
        },
        partners: {
          Component: "/app/(payload)/admin/PartnersListView.tsx",
          exact: true,
          path: "/partners",
        },
        media: {
          Component: "/app/(payload)/admin/MediaListView.tsx",
          exact: true,
          path: "/media",
        },
        musicTracks: {
          Component: "/app/(payload)/admin/MusicTracksListView.tsx",
          exact: true,
          path: "/music-tracks",
        },
        menu: {
          Component: "/app/(payload)/admin/MenuView.tsx",
          exact: true,
          path: "/menu",
        },
        tickets: {
          Component: "/app/(payload)/admin/TicketsListView.tsx",
          exact: true,
          path: "/tickets",
        },
        products: {
          Component: "/app/(payload)/admin/ProductsListView.tsx",
          exact: true,
          path: "/products",
        },
        soldTickets: {
          Component: "/app/(payload)/admin/SoldTicketsListView.tsx",
          exact: true,
          path: "/sold-tickets",
        },
        productOrders: {
          Component: "/app/(payload)/admin/ProductOrdersListView.tsx",
          exact: true,
          path: "/product-orders",
        },
        jokerTickets: {
          Component: "/app/(payload)/admin/JokerTicketsListView.tsx",
          exact: true,
          path: "/joker-tickets",
        },
        emailJobs: {
          Component: "/app/(payload)/admin/EmailJobsListView.tsx",
          exact: true,
          path: "/emails",
        },
        users: {
          Component: "/app/(payload)/admin/UsersListView.tsx",
          exact: true,
          path: "/users",
        },
      },
    },
  },
  editor: lexicalEditor(),
  collections: [
    Pages,
    Posts,
    Partners,
    Tickets,
    Products,
    SoldTickets,
    ProductOrders,
    JokerTickets,
    MessageJobs,
    MusicTracks,
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
  plugins: [
    // Vercel Blob only on Vercel (VERCEL=1). Locally always use disk (public/media)
    // even if BLOB_READ_WRITE_TOKEN is in .env.local — wrong token = upload 500.
    ...(() => {
      const onVercel = process.env.VERCEL === "1";
      const blobToken = onVercel ? process.env.BLOB_READ_WRITE_TOKEN : undefined;
      return [
        vercelBlobStorage({
          enabled: Boolean(blobToken),
          collections: { media: true },
          token: blobToken || "",
        }),
      ];
    })(),
  ],
  sharp,
});
  