import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Posts title/excerpt moved off Payload localization (posts_locales) onto flat
// per-locale columns (title_ka, title_en, ...) so all four languages edit
// together in tabs. Additive only: the old posts_locales table is left in place
// (prod cannot run destructive migrations). Data is copied across by the
// backfill step in instrumentation.ts.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "title_ka" varchar;
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "title_en" varchar;
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "title_ru" varchar;
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "title_ua" varchar;
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "excerpt_ka" varchar;
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "excerpt_en" varchar;
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "excerpt_ru" varchar;
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "excerpt_ua" varchar;
    ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_title_ka" varchar;
    ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_title_en" varchar;
    ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_title_ru" varchar;
    ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_title_ua" varchar;
    ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_excerpt_ka" varchar;
    ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_excerpt_en" varchar;
    ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_excerpt_ru" varchar;
    ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_excerpt_ua" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "title_ka";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "title_en";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "title_ru";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "title_ua";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "excerpt_ka";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "excerpt_en";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "excerpt_ru";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "excerpt_ua";
    ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_title_ka";
    ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_title_en";
    ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_title_ru";
    ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_title_ua";
    ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_excerpt_ka";
    ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_excerpt_en";
    ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_excerpt_ru";
    ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_excerpt_ua";
  `)
}
