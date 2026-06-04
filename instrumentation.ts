/**
 * Runs once when a Next.js server instance boots (Node runtime only).
 * Deploy-independent and best-effort: it must never block/break startup.
 *
 * Two jobs:
 *  1. Ensure a Payload admin user exists (opt-in via ADMIN_BOOTSTRAP=true), so
 *     you always have known /admin credentials.
 *  2. Seed the demo t-shirts so the storefront + homepage reel are populated.
 */
export async function register() {
  // DB access only makes sense on the Node.js runtime, never the Edge runtime.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });

  await ensureAdminUser(payload);
  await seedDemoTshirts(payload);
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
