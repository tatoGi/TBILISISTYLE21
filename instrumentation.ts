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
  await ensureAdminUser(payload);
  await seedDemoTshirts(payload);
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
    const { seedTshirts, TSHIRTS } = await import("./lib/seed-tshirts");

    // Cheap guard: skip the per-title checks once everything is already seeded.
    const { totalDocs } = await payload.count({
      collection: "products",
      where: { title: { like: "Tbilisi Style 21 Tee" } },
    });
    if (totalDocs >= TSHIRTS.length) return;

    const { created } = await seedTshirts(payload);
    if (created > 0) {
      payload.logger.info(`[seed] created ${created} demo t-shirts`);
    }
  } catch (err) {
    // Seeding is best-effort; a failure must never prevent the app from booting.
    console.error("[seed] demo t-shirt seeding skipped:", err);
  }
}
