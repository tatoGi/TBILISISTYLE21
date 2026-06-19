import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Idempotent catch-up for Neon/prod DBs that ran init but missed later
 * migrations. Adds document-lock rel columns Payload expects at runtime.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "partners_id" uuid;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_partners_id_idx"
      ON "payload_locked_documents_rels" ("partners_id");
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_partners_fk') THEN
        ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk"
          FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "music_tracks_id" uuid;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_music_tracks_id_idx"
      ON "payload_locked_documents_rels" ("music_tracks_id");
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'music_tracks'
      ) AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_music_tracks_fk') THEN
        ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_music_tracks_fk"
          FOREIGN KEY ("music_tracks_id") REFERENCES "public"."music_tracks"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_music_tracks_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_music_tracks_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "music_tracks_id";

    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_partners_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_partners_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "partners_id";
  `);
}
