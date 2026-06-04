/**
 * Runs once when a Next.js server instance boots. We use it to guarantee the
 * demo t-shirts exist in production even if the build-time `payload migrate`
 * step didn't run (e.g. the Vercel build command isn't `npm run ci`). It is
 * idempotent and deploy-independent, and never blocks/breaks startup on error.
 */
export async function register() {
  // DB access only makes sense on the Node.js runtime, never the Edge runtime.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Allow opting out (e.g. previews) without touching code.
  if (process.env.SEED_DEMO_TSHIRTS === "false") return;

  try {
    const { getPayload } = await import("payload");
    const { default: config } = await import("@payload-config");
    const { seedTshirts, TSHIRTS } = await import("./lib/seed-tshirts");

    const payload = await getPayload({ config });

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
