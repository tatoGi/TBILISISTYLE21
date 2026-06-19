import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Tables/columns added via local dev push but never migrated to prod:
 * Contact content block (pages + posts + versions), site contact/social/music
 * fields, and the MusicTracks collection.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "contact_phone" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "contact_email" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "contact_address" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "instagram_url" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "tiktok_url" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "acknowledged_ticket_tier" numeric DEFAULT 0;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "background_music_id" uuid;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "music_title" varchar;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "music_loop" boolean DEFAULT true;

    CREATE TABLE IF NOT EXISTS "pages_blocks_contact" (
      "_order" integer NOT NULL,
      "_parent_id" uuid NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "show_payments" boolean DEFAULT true,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "pages_blocks_contact_order_idx" ON "pages_blocks_contact" ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_contact_parent_id_idx" ON "pages_blocks_contact" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_contact_path_idx" ON "pages_blocks_contact" ("_path");
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_contact_parent_id_fk') THEN
        ALTER TABLE "pages_blocks_contact" ADD CONSTRAINT "pages_blocks_contact_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_contact" (
      "_order" integer NOT NULL,
      "_parent_id" uuid NOT NULL,
      "_path" text NOT NULL,
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "show_payments" boolean DEFAULT true,
      "_uuid" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contact_order_idx" ON "_pages_v_blocks_contact" ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contact_parent_id_idx" ON "_pages_v_blocks_contact" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_contact_path_idx" ON "_pages_v_blocks_contact" ("_path");
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_contact_parent_id_fk') THEN
        ALTER TABLE "_pages_v_blocks_contact" ADD CONSTRAINT "_pages_v_blocks_contact_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "posts_blocks_contact" (
      "_order" integer NOT NULL,
      "_parent_id" uuid NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "show_payments" boolean DEFAULT true,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "posts_blocks_contact_order_idx" ON "posts_blocks_contact" ("_order");
    CREATE INDEX IF NOT EXISTS "posts_blocks_contact_parent_id_idx" ON "posts_blocks_contact" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "posts_blocks_contact_path_idx" ON "posts_blocks_contact" ("_path");
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_blocks_contact_parent_id_fk') THEN
        ALTER TABLE "posts_blocks_contact" ADD CONSTRAINT "posts_blocks_contact_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "_posts_v_blocks_contact" (
      "_order" integer NOT NULL,
      "_parent_id" uuid NOT NULL,
      "_path" text NOT NULL,
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "show_payments" boolean DEFAULT true,
      "_uuid" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "_posts_v_blocks_contact_order_idx" ON "_posts_v_blocks_contact" ("_order");
    CREATE INDEX IF NOT EXISTS "_posts_v_blocks_contact_parent_id_idx" ON "_posts_v_blocks_contact" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_posts_v_blocks_contact_path_idx" ON "_posts_v_blocks_contact" ("_path");
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_posts_v_blocks_contact_parent_id_fk') THEN
        ALTER TABLE "_posts_v_blocks_contact" ADD CONSTRAINT "_posts_v_blocks_contact_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "site_background_music_idx" ON "site" ("background_music_id");
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_background_music_id_media_id_fk') THEN
        ALTER TABLE "site" ADD CONSTRAINT "site_background_music_id_media_id_fk"
          FOREIGN KEY ("background_music_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_music_tracks_status') THEN
        CREATE TYPE "public"."enum_music_tracks_status" AS ENUM('draft', 'active');
      END IF;
    END $$;
    CREATE TABLE IF NOT EXISTS "music_tracks" (
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
    );
    CREATE INDEX IF NOT EXISTS "music_tracks_audio_file_idx" ON "music_tracks" ("audio_file_id");
    CREATE INDEX IF NOT EXISTS "music_tracks_updated_at_idx" ON "music_tracks" ("updated_at");
    CREATE INDEX IF NOT EXISTS "music_tracks_created_at_idx" ON "music_tracks" ("created_at");
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'music_tracks_audio_file_id_media_id_fk') THEN
        ALTER TABLE "music_tracks" ADD CONSTRAINT "music_tracks_audio_file_id_media_id_fk"
          FOREIGN KEY ("audio_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "music_tracks" CASCADE;
    DROP TYPE IF EXISTS "enum_music_tracks_status";
    DROP TABLE IF EXISTS "_posts_v_blocks_contact" CASCADE;
    DROP TABLE IF EXISTS "posts_blocks_contact" CASCADE;
    DROP TABLE IF EXISTS "_pages_v_blocks_contact" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_contact" CASCADE;
  `);
}
