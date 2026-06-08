import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Phase 3 of the locale-tabs migration: the localized fields inside content
// blocks (hero heading/subheading/ctaLabel, richText content, image caption,
// gallery image caption, cta label) move off Payload localization onto flat
// per-locale columns on each block table. Additive only; the matching
// *_blocks_*_locales tables stay in place and are copied across by the backfill
// step in instrumentation.ts.

// Block tables exist for both collections (pages/posts) and their drafts
// versions (_pages_v / _posts_v). Block subfield columns are NOT version_-prefixed.
const PREFIXES = ['pages_blocks', '_pages_v_blocks', 'posts_blocks', '_posts_v_blocks']

// blockType -> localized columns (snake_case) of type varchar.
// Column roots match Payload's to-snake-case naming for the suffixed fields:
// the camelCase `ctaLabel` field becomes the column root "ctalabel" (not
// "cta_label", which is the old, un-suffixed locale-table column name).
const VARCHAR_COLS: Record<string, string[]> = {
  hero: ['heading', 'subheading', 'ctalabel'],
  image: ['caption'],
  gallery_images: ['caption'],
  cta: ['label'],
}
// blockType -> localized columns of type jsonb (rich text).
const JSONB_COLS: Record<string, string[]> = {
  rich_text: ['content'],
}

const LOCALES = ['ka', 'en', 'ru', 'ua']

function statements(action: 'add' | 'drop'): string[] {
  const out: string[] = []
  for (const prefix of PREFIXES) {
    const groups: [Record<string, string[]>, string][] = [
      [VARCHAR_COLS, 'varchar'],
      [JSONB_COLS, 'jsonb'],
    ]
    for (const [cols, type] of groups) {
      for (const [blockType, columns] of Object.entries(cols)) {
        const table = `${prefix}_${blockType}`
        for (const col of columns) {
          for (const loc of LOCALES) {
            out.push(
              action === 'add'
                ? `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${col}_${loc}" ${type};`
                : `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "${col}_${loc}";`,
            )
          }
        }
      }
    }
  }
  return out
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const statement of statements('add')) {
    await db.execute(sql.raw(statement))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const statement of statements('drop')) {
    await db.execute(sql.raw(statement))
  }
}
