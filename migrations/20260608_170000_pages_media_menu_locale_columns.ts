import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Phase 2 of the locale-tabs migration: Pages short fields (title, navLabel,
// metaTitle, metaDescription), Media alt and the SiteSettings menu label move
// off Payload localization onto flat per-locale columns. Additive only; the old
// *_locales tables stay in place and are copied across by the backfill step in
// instrumentation.ts.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "title_ka" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "title_en" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "title_ru" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "title_ua" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "navlabel_ka" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "navlabel_en" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "navlabel_ru" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "navlabel_ua" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "metatitle_ka" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "metatitle_en" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "metatitle_ru" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "metatitle_ua" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "metadescription_ka" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "metadescription_en" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "metadescription_ru" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "metadescription_ua" varchar;

    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_title_ka" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_title_en" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_title_ru" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_title_ua" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_navlabel_ka" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_navlabel_en" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_navlabel_ru" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_navlabel_ua" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_metatitle_ka" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_metatitle_en" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_metatitle_ru" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_metatitle_ua" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_metadescription_ka" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_metadescription_en" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_metadescription_ru" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_metadescription_ua" varchar;

    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "alt_ka" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "alt_en" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "alt_ru" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "alt_ua" varchar;

    ALTER TABLE "site_menu" ADD COLUMN IF NOT EXISTS "label_ka" varchar;
    ALTER TABLE "site_menu" ADD COLUMN IF NOT EXISTS "label_en" varchar;
    ALTER TABLE "site_menu" ADD COLUMN IF NOT EXISTS "label_ru" varchar;
    ALTER TABLE "site_menu" ADD COLUMN IF NOT EXISTS "label_ua" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "title_ka";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "title_en";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "title_ru";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "title_ua";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "navlabel_ka";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "navlabel_en";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "navlabel_ru";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "navlabel_ua";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "metatitle_ka";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "metatitle_en";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "metatitle_ru";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "metatitle_ua";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "metadescription_ka";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "metadescription_en";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "metadescription_ru";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "metadescription_ua";

    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_title_ka";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_title_en";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_title_ru";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_title_ua";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_navlabel_ka";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_navlabel_en";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_navlabel_ru";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_navlabel_ua";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_metatitle_ka";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_metatitle_en";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_metatitle_ru";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_metatitle_ua";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_metadescription_ka";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_metadescription_en";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_metadescription_ru";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_metadescription_ua";

    ALTER TABLE "media" DROP COLUMN IF EXISTS "alt_ka";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "alt_en";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "alt_ru";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "alt_ua";

    ALTER TABLE "site_menu" DROP COLUMN IF EXISTS "label_ka";
    ALTER TABLE "site_menu" DROP COLUMN IF EXISTS "label_en";
    ALTER TABLE "site_menu" DROP COLUMN IF EXISTS "label_ru";
    ALTER TABLE "site_menu" DROP COLUMN IF EXISTS "label_ua";
  `)
}
