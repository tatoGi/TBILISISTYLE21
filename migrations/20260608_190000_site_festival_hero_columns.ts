import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "herobadge_ka" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "herobadge_en" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "herobadge_ru" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "herobadge_ua" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "herotitle_ka" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "herotitle_en" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "herotitle_ru" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "herotitle_ua" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "herotagline_ka" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "herotagline_en" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "herotagline_ru" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "herotagline_ua" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site" DROP COLUMN IF EXISTS "herobadge_ka";
    ALTER TABLE "site" DROP COLUMN IF EXISTS "herobadge_en";
    ALTER TABLE "site" DROP COLUMN IF EXISTS "herobadge_ru";
    ALTER TABLE "site" DROP COLUMN IF EXISTS "herobadge_ua";
    ALTER TABLE "site" DROP COLUMN IF EXISTS "herotitle_ka";
    ALTER TABLE "site" DROP COLUMN IF EXISTS "herotitle_en";
    ALTER TABLE "site" DROP COLUMN IF EXISTS "herotitle_ru";
    ALTER TABLE "site" DROP COLUMN IF EXISTS "herotitle_ua";
    ALTER TABLE "site" DROP COLUMN IF EXISTS "herotagline_ka";
    ALTER TABLE "site" DROP COLUMN IF EXISTS "herotagline_en";
    ALTER TABLE "site" DROP COLUMN IF EXISTS "herotagline_ru";
    ALTER TABLE "site" DROP COLUMN IF EXISTS "herotagline_ua";
  `);
}
