import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Additive en/ru/ua columns for localeTabsKeepBase collections. The base
 * `title`/`description` columns stay as Georgian; payment/seed code unchanged.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "title_en" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "title_ru" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "title_ua" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description_en" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description_ru" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description_ua" varchar;

    ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "title_en" varchar;
    ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "title_ru" varchar;
    ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "title_ua" varchar;
    ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "description_en" varchar;
    ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "description_ru" varchar;
    ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "description_ua" varchar;

    ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "description_en" varchar;
    ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "description_ru" varchar;
    ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "description_ua" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "title_en";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "title_ru";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "title_ua";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "description_en";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "description_ru";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "description_ua";

    ALTER TABLE "tickets" DROP COLUMN IF EXISTS "title_en";
    ALTER TABLE "tickets" DROP COLUMN IF EXISTS "title_ru";
    ALTER TABLE "tickets" DROP COLUMN IF EXISTS "title_ua";
    ALTER TABLE "tickets" DROP COLUMN IF EXISTS "description_en";
    ALTER TABLE "tickets" DROP COLUMN IF EXISTS "description_ru";
    ALTER TABLE "tickets" DROP COLUMN IF EXISTS "description_ua";

    ALTER TABLE "partners" DROP COLUMN IF EXISTS "description_en";
    ALTER TABLE "partners" DROP COLUMN IF EXISTS "description_ru";
    ALTER TABLE "partners" DROP COLUMN IF EXISTS "description_ua";
  `);
}
