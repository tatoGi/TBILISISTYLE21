/**
 * Runs once when a Next.js server instance boots (Node runtime only).
 * Deploy-independent and best-effort: it must never block/break startup.
 *
 * Three jobs:
 *  1. Ensure the production schema is in sync with the config (some columns,
 *     like pages.route_path, were added after the init migration).
 *  2. Ensure a Payload admin user exists (opt-in via ADMIN_BOOTSTRAP=true), so
 *     you always have known /admin credentials.
 *  3. Seed the demo t-shirts so the storefront + homepage reel are populated.
 */
export async function register() {
  // DB access only makes sense on the Node.js runtime, never the Edge runtime.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });

  await ensureSchema(payload);
  await backfillLocaleColumns(payload);
  await ensureAdminUser(payload);
  await seedDemoTshirts(payload);
}

/**
 * One-time copy of existing translations from the old `*_locales` tables into
 * the new flat per-locale columns (see fields/localeTabs.ts). Idempotent: each
 * row is only filled while its target columns are still NULL, so admin edits
 * always win. Best-effort - if a source locale table was already dropped (e.g.
 * local dev push), the statement just errors and is skipped.
 */
const LOCALES = ["ka", "en", "ru", "ua"];

// Payload derives DB column names with the `to-snake-case` package. For a
// camelCase field suffixed with a locale it lowercases the whole base (e.g.
// navLabel_ka -> "navlabel_ka", metaTitle_ka -> "metatitle_ka"), but the OLD
// (un-suffixed) localized field used normal snake_case (navLabel -> "nav_label").
// So a localized field is identified by its camelCase `base`, from which we
// derive both the new per-locale column and the old `*_locales` source column.
const camelToSnake = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
const targetCol = (base: string, loc: string, versioned = false) =>
  `${versioned ? "version_" : ""}${base.toLowerCase()}_${loc}`;

/** ADD COLUMN IF NOT EXISTS for each `base`'s per-locale column. */
function localeColumns(
  table: string,
  bases: string[],
  opts: { type?: string; versioned?: boolean } = {},
): string[] {
  const { type = "varchar", versioned = false } = opts;
  return bases.flatMap((base) =>
    LOCALES.map(
      (loc) =>
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${targetCol(base, loc, versioned)}" ${type};`,
    ),
  );
}

// Content block tables exist for both collections (pages/posts) and their drafts
// versions; block subfield columns are not version_-prefixed. Bases are the
// camelCase field names from blocks/contentBlocks.ts.
const BLOCK_PREFIXES = ["pages_blocks", "_pages_v_blocks", "posts_blocks", "_posts_v_blocks"];
const BLOCK_VARCHAR_COLS: Record<string, string[]> = {
  hero: ["heading", "subheading", "ctaLabel"],
  image: ["caption"],
  gallery_images: ["caption"],
  cta: ["label"],
};
const BLOCK_JSONB_COLS: Record<string, string[]> = { rich_text: ["content"] };

// Additive translation columns for collections whose base column (`title`,
// `description`) is kept as Georgian and read by code that must not change
// (ticket/product payment flow, seed scripts). See fields/localeTabsKeepBase.
const TRANSLATION_LOCALES = ["en", "ru", "ua"];
function translationColumns(table: string, bases: string[]): string[] {
  return bases.flatMap((base) =>
    TRANSLATION_LOCALES.map(
      (loc) => `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${base}_${loc}" varchar;`,
    ),
  );
}

function blockLocaleColumns(): string[] {
  const out: string[] = [];
  for (const prefix of BLOCK_PREFIXES) {
    for (const [blockType, cols] of Object.entries(BLOCK_VARCHAR_COLS)) {
      out.push(...localeColumns(`${prefix}_${blockType}`, cols, { type: "varchar" }));
    }
    for (const [blockType, cols] of Object.entries(BLOCK_JSONB_COLS)) {
      out.push(...localeColumns(`${prefix}_${blockType}`, cols, { type: "jsonb" }));
    }
  }
  return out;
}

/** Backfill spec: copy each `base` from `source` (a *_locales table) into the
 * matching per-locale column on `target`. `bases` are camelCase field names. */
type BackfillSpec = { target: string; source: string; bases: string[] };

const BACKFILLS: BackfillSpec[] = [
  { target: "posts", source: "posts_locales", bases: ["title", "excerpt"] },
  {
    target: "pages",
    source: "pages_locales",
    bases: ["title", "navLabel", "metaTitle", "metaDescription"],
  },
  { target: "media", source: "media_locales", bases: ["alt"] },
  { target: "site_menu", source: "site_menu_locales", bases: ["label"] },
  ...blockBackfills(),
];

/** Backfill specs for every content-block table (pages/posts + versions). */
function blockBackfills(): BackfillSpec[] {
  const blockBases: Record<string, string[]> = {
    hero: ["heading", "subheading", "ctaLabel"],
    rich_text: ["content"],
    image: ["caption"],
    gallery_images: ["caption"],
    cta: ["label"],
  };
  const out: BackfillSpec[] = [];
  for (const prefix of BLOCK_PREFIXES) {
    for (const [blockType, bases] of Object.entries(blockBases)) {
      const table = `${prefix}_${blockType}`;
      out.push({ target: table, source: `${table}_locales`, bases });
    }
  }
  return out;
}

async function backfillLocaleColumns(payload: Awaited<ReturnType<typeof import("payload").getPayload>>) {
  const pool = (payload.db as unknown as { pool?: { query: (sql: string) => Promise<unknown> } }).pool;
  if (!pool) return;

  for (const { target, source, bases } of BACKFILLS) {
    for (const loc of LOCALES) {
      const setClause = bases
        .map((b) => `"${targetCol(b, loc)}" = l."${camelToSnake(b)}"`)
        .join(", ");
      // Only fill rows whose target columns are all still empty, so admin edits win.
      const guard = bases.map((b) => `p."${targetCol(b, loc)}" IS NULL`).join(" AND ");
      const statement = `UPDATE "${target}" p SET ${setClause}
        FROM "${source}" l
        WHERE l."_parent_id" = p."id" AND l."_locale" = '${loc}' AND (${guard});`;
      try {
        await pool.query(statement);
      } catch (err) {
        // 42P01 = source or target table gone (e.g. local dev already dropped *_locales).
        // Expected after schema push — not a startup failure.
        const code = (err as { code?: string }).code;
        if (code !== "42P01") {
          console.error(`[backfill] ${target} <- ${source} (${loc}) skipped:`, err);
        }
      }
    }
  }
}

/**
 * Safety net for schema drift on environments that only run migrations (e.g.
 * Vercel/Neon). Local dev auto-pushes the schema, so it can silently get ahead
 * of what the committed migrations create. Each statement is idempotent
 * (IF NOT EXISTS) and best-effort: it must never block startup.
 */
async function ensureSchema(payload: Awaited<ReturnType<typeof import("payload").getPayload>>) {
  const pool = (payload.db as unknown as { pool?: { query: (sql: string) => Promise<unknown> } }).pool;
  if (!pool) return;

  const statements = [
    `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "route_path" varchar;`,
    // Drafts are enabled, so Payload also reads/writes the versions table when
    // editing a page. Without the mirrored column the editor query fails and the
    // admin redirects to the list with ?notFound=<id>.
    `ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_route_path" varchar;`,

    // Partners collection (added after the prod schema was first created). The
    // committed migration covers fresh DBs, but prod was bootstrapped via push /
    // data-migration, so `payload migrate` can't replay it here — recreate the
    // table idempotently instead.
    `CREATE TABLE IF NOT EXISTS "partners" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" varchar NOT NULL,
      "description" varchar,
      "logo_id" uuid NOT NULL,
      "website" varchar,
      "featured_on_home" boolean DEFAULT false,
      "order" numeric DEFAULT 100,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );`,
    `ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "description" varchar;`,
    `CREATE INDEX IF NOT EXISTS "partners_logo_idx" ON "partners" ("logo_id");`,
    `CREATE INDEX IF NOT EXISTS "partners_updated_at_idx" ON "partners" ("updated_at");`,
    `CREATE INDEX IF NOT EXISTS "partners_created_at_idx" ON "partners" ("created_at");`,
    // FK to media — ADD CONSTRAINT has no IF NOT EXISTS, so guard with a DO block
    // to stay quiet (and idempotent) on every subsequent boot.
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partners_logo_id_media_id_fk') THEN
        ALTER TABLE "partners" ADD CONSTRAINT "partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;`,
    // Admin document-locking relation for the new collection.
    `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "partners_id" uuid;`,
    `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_partners_id_idx" ON "payload_locked_documents_rels" ("partners_id");`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_partners_fk') THEN
        ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;`,

    // "Feature on homepage" flag on News/Posts (+ mirrored versions column).
    `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "featured_on_home" boolean DEFAULT false;`,
    `ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_featured_on_home" boolean DEFAULT false;`,

    // Posts title/excerpt converted from Payload localization to flat per-locale
    // columns (edited as language tabs). Mirrored on the _posts_v versions table.
    `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "title_ka" varchar;`,
    `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "title_en" varchar;`,
    `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "title_ru" varchar;`,
    `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "title_ua" varchar;`,
    `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "excerpt_ka" varchar;`,
    `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "excerpt_en" varchar;`,
    `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "excerpt_ru" varchar;`,
    `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "excerpt_ua" varchar;`,
    `ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_title_ka" varchar;`,
    `ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_title_en" varchar;`,
    `ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_title_ru" varchar;`,
    `ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_title_ua" varchar;`,
    `ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_excerpt_ka" varchar;`,
    `ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_excerpt_en" varchar;`,
    `ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_excerpt_ru" varchar;`,
    `ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_excerpt_ua" varchar;`,

    // Phase 2: Pages title/navLabel/metaTitle/metaDescription, Media alt and the
    // SiteSettings menu label converted to flat per-locale columns (language tabs).
    ...localeColumns("pages", ["title", "navLabel", "metaTitle", "metaDescription"]),
    ...localeColumns("_pages_v", ["title", "navLabel", "metaTitle", "metaDescription"], {
      versioned: true,
    }),
    ...localeColumns("media", ["alt"]),
    ...localeColumns("site_menu", ["label"]),
    // Site global — festival landing hero (badge / title / tagline).
    ...localeColumns("site", ["heroBadge", "heroTitle", "heroTagline"]),
    // Site global — festival landing background music (upload + options).
    `ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "background_music_id" uuid;`,
    `ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "music_title" varchar;`,
    `ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "music_loop" boolean DEFAULT true;`,
    // Site global — social links (Instagram / TikTok) shown in the footer.
    `ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "instagram_url" varchar;`,
    `ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "tiktok_url" varchar;`,
    // Site global — highest acknowledged 5000-ticket price tier (dashboard alert).
    `ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "acknowledged_ticket_tier" numeric DEFAULT 0;`,
    // Site global — editable contact details (Contact page + footer).
    `ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "contact_phone" varchar;`,
    `ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "contact_email" varchar;`,
    `ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "contact_address" varchar;`,

    // "Contact" content block (blocks/contentBlocks.ts) — created via local dev
    // push only, so prod (migrations only) needs the tables recreated here.
    `CREATE TABLE IF NOT EXISTS "pages_blocks_contact" (
      "_order" integer NOT NULL,
      "_parent_id" uuid NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "show_payments" boolean DEFAULT true,
      "block_name" varchar
    );`,
    `ALTER TABLE "pages_blocks_contact" ADD COLUMN IF NOT EXISTS "show_payments" boolean DEFAULT true;`,
    `CREATE INDEX IF NOT EXISTS "pages_blocks_contact_order_idx" ON "pages_blocks_contact" ("_order");`,
    `CREATE INDEX IF NOT EXISTS "pages_blocks_contact_parent_id_idx" ON "pages_blocks_contact" ("_parent_id");`,
    `CREATE INDEX IF NOT EXISTS "pages_blocks_contact_path_idx" ON "pages_blocks_contact" ("_path");`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_contact_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_contact" ADD CONSTRAINT "pages_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_contact" (
      "_order" integer NOT NULL,
      "_parent_id" uuid NOT NULL,
      "_path" text NOT NULL,
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "show_payments" boolean DEFAULT true,
      "_uuid" varchar,
      "block_name" varchar
    );`,
    `ALTER TABLE "_pages_v_blocks_contact" ADD COLUMN IF NOT EXISTS "show_payments" boolean DEFAULT true;`,
    `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contact_order_idx" ON "_pages_v_blocks_contact" ("_order");`,
    `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contact_parent_id_idx" ON "_pages_v_blocks_contact" ("_parent_id");`,
    `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contact_path_idx" ON "_pages_v_blocks_contact" ("_path");`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_contact_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_contact" ADD CONSTRAINT "_pages_v_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;`,
    `CREATE INDEX IF NOT EXISTS "site_background_music_idx" ON "site" ("background_music_id");`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_background_music_id_media_id_fk') THEN
        ALTER TABLE "site" ADD CONSTRAINT "site_background_music_id_media_id_fk" FOREIGN KEY ("background_music_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;`,

    // MusicTracks collection (festival background music list). Created via local
    // dev push only — no committed migration covers it, so prod (which only runs
    // migrations) is missing the table. Recreate it idempotently here. The base
    // `title` stays Georgian with additive en/ru/ua columns (localeTabsKeepBase).
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_music_tracks_status') THEN
        CREATE TYPE "public"."enum_music_tracks_status" AS ENUM('draft', 'active');
      END IF;
    END $$;`,
    `CREATE TABLE IF NOT EXISTS "music_tracks" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "title" varchar NOT NULL,
      "title_en" varchar,
      "title_ru" varchar,
      "title_ua" varchar,
      "artist" varchar,
      "audio_file_id" uuid NOT NULL,
      "order" numeric DEFAULT 0,
      "status" "enum_music_tracks_status" DEFAULT 'draft' NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );`,
    // Additive locale columns guarded in case the table predates them.
    `ALTER TABLE "music_tracks" ADD COLUMN IF NOT EXISTS "title_en" varchar;`,
    `ALTER TABLE "music_tracks" ADD COLUMN IF NOT EXISTS "title_ru" varchar;`,
    `ALTER TABLE "music_tracks" ADD COLUMN IF NOT EXISTS "title_ua" varchar;`,
    `CREATE INDEX IF NOT EXISTS "music_tracks_audio_file_idx" ON "music_tracks" ("audio_file_id");`,
    `CREATE INDEX IF NOT EXISTS "music_tracks_updated_at_idx" ON "music_tracks" ("updated_at");`,
    `CREATE INDEX IF NOT EXISTS "music_tracks_created_at_idx" ON "music_tracks" ("created_at");`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'music_tracks_audio_file_id_media_id_fk') THEN
        ALTER TABLE "music_tracks" ADD CONSTRAINT "music_tracks_audio_file_id_media_id_fk" FOREIGN KEY ("audio_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;`,
    // Admin document-locking relation for the new collection.
    `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "music_tracks_id" uuid;`,
    `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_music_tracks_id_idx" ON "payload_locked_documents_rels" ("music_tracks_id");`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_music_tracks_fk') THEN
        ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_music_tracks_fk" FOREIGN KEY ("music_tracks_id") REFERENCES "public"."music_tracks"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;`,

    // Phase 3: localized fields inside content blocks (hero/richText/image/
    // gallery/cta) converted to flat per-locale columns on each block table.
    ...blockLocaleColumns(),

    // Phase 4: en/ru/ua translation columns for Tickets, Products and Partners.
    // The base `title`/`description` columns stay as Georgian (read by the
    // payment flow and seed scripts), so only the suffixed columns are added.
    ...translationColumns("tickets", ["title", "description"]),
    ...translationColumns("products", ["title", "description"]),
    ...translationColumns("partners", ["description"]),
  ];

  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (err) {
      console.error("[schema] ensure step skipped:", statement, err);
    }
  }
}

/**
 * Create (or reset) the Payload admin user from env vars when ADMIN_BOOTSTRAP
 * is enabled. Lets you log in at /admin with:
 *   email    = PAYLOAD_ADMIN_EMAIL (default below)
 *   password = ADMIN_PASSWORD
 * Turn ADMIN_BOOTSTRAP off again once you're in.
 */
async function ensureAdminUser(payload: Awaited<ReturnType<typeof import("payload").getPayload>>) {
  if (process.env.ADMIN_BOOTSTRAP !== "true") return;

  const email =
    process.env.PAYLOAD_ADMIN_EMAIL || "tato.laperashvili95@gmail.com";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error("[bootstrap] ADMIN_BOOTSTRAP=true but ADMIN_PASSWORD is not set");
    return;
  }

  try {
    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    });

    if (existing.docs[0]) {
      await payload.update({
        collection: "users",
        id: existing.docs[0].id,
        data: { password },
      });
      payload.logger.info(`[bootstrap] reset admin password for ${email}`);
    } else {
      await payload.create({
        collection: "users",
        data: { email, password },
      });
      payload.logger.info(`[bootstrap] created admin user ${email}`);
    }
  } catch (err) {
    console.error("[bootstrap] admin user bootstrap skipped:", err);
  }
}

async function seedDemoTshirts(payload: Awaited<ReturnType<typeof import("payload").getPayload>>) {
  if (process.env.SEED_DEMO_TSHIRTS === "false") return;

  try {
    const { seedTshirts } = await import("./lib/seed-tshirts");

    // Only ever seed a brand-new, empty storefront. Once ANY product exists we
    // never seed again — otherwise products an admin deleted in production would
    // be resurrected on the next server boot (Vercel cold starts are frequent).
    const { totalDocs } = await payload.count({ collection: "products" });
    if (totalDocs > 0) return;

    const { created } = await seedTshirts(payload);
    if (created > 0) {
      payload.logger.info(`[seed] created ${created} demo t-shirts`);
    }
  } catch (err) {
    // Seeding is best-effort; a failure must never prevent the app from booting.
    console.error("[seed] demo t-shirt seeding skipped:", err);
  }
}
