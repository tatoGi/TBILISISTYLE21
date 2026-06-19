// Add en/ru/ua translation columns for products, tickets, partners on Neon (or any
// Postgres). Safe to re-run (IF NOT EXISTS).
//
//   $env:POSTGRES_URL="<neon pooled url>"; node scripts/apply-product-translation-columns.mjs
//
// Or paste the SQL from migrations/20260619_091300_products_tickets_partners_translation_columns.ts
// into the Neon SQL editor.

import pg from "pg";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error(
    "Missing DATABASE_URL / POSTGRES_URL. Example:\n" +
      '  $env:POSTGRES_URL="postgresql://..."; node scripts/apply-product-translation-columns.mjs',
  );
  process.exit(1);
}

const statements = [
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "title_en" varchar`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "title_ru" varchar`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "title_ua" varchar`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description_en" varchar`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description_ru" varchar`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description_ua" varchar`,
  `ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "title_en" varchar`,
  `ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "title_ru" varchar`,
  `ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "title_ua" varchar`,
  `ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "description_en" varchar`,
  `ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "description_ru" varchar`,
  `ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "description_ua" varchar`,
  `ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "description_en" varchar`,
  `ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "description_ru" varchar`,
  `ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "description_ua" varchar`,
];

const pool = new pg.Pool({ connectionString });

try {
  for (const sql of statements) {
    await pool.query(sql);
    console.log("OK:", sql);
  }
  console.log("Done — products/tickets/partners translation columns are ready.");
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await pool.end();
}
