import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The Pages.routePath field was added to the config after the init migration,
// so production never got the `route_path` column. IF NOT EXISTS keeps it safe
// to run on databases (e.g. local dev) that already have it.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "route_path" varchar;`)
  // Drafts are enabled on Pages, so the field is mirrored in the versions table.
  await db.execute(sql`ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_route_path" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "pages" DROP COLUMN IF EXISTS "route_path";`)
  await db.execute(sql`ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_route_path";`)
}
