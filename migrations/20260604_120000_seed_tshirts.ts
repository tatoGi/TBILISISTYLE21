import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { seedTshirts, removeSeededTshirts } from '../lib/seed-tshirts'

// Demo merch: 15 t-shirts so the storefront + homepage reel are populated on
// every fresh deploy. Idempotent — see lib/seed-tshirts.ts.

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await seedTshirts(payload, { req })
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await removeSeededTshirts(payload, { req })
}
