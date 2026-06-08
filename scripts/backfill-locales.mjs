// One-time, safe migration of localized CMS content from Payload's old
// `*_locales` tables into the new flat per-locale columns (title_ka, navlabel_en,
// …). Run this BEFORE letting Payload's dev push drop the old locale tables, so
// no translations are lost.
//
//   node --env-file=.env.local scripts/backfill-locales.mjs
//
// Idempotent: columns are added IF NOT EXISTS and each row is only filled while
// its target columns are still empty. It also drops the mis-named columns from
// an earlier version of this script (nav_label_* etc.). The old *_locales tables
// are left untouched.

import pg from "pg";

const LOCALES = ["ka", "en", "ru", "ua"];
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL / POSTGRES_URL. Run with: node --env-file=.env.local scripts/backfill-locales.mjs");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

// Payload names the new per-locale column by lowercasing the camelCase base and
// appending _<locale> (navLabel -> "navlabel_ka"). The OLD *_locales source
// column is the normal snake_case of the base (navLabel -> "nav_label").
const camelToSnake = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
const targetCol = (base, loc, versioned = false) =>
  `${versioned ? "version_" : ""}${base.toLowerCase()}_${loc}`;

const addCol = (table, col, type) =>
  `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${col}" ${type};`;

function localeCols(table, bases, { type = "varchar", versioned = false } = {}) {
  const out = [];
  for (const base of bases) {
    for (const loc of LOCALES) out.push(addCol(table, targetCol(base, loc, versioned), type));
  }
  return out;
}

const BLOCK_PREFIXES = ["pages_blocks", "_pages_v_blocks", "posts_blocks", "_posts_v_blocks"];
const BLOCK_VARCHAR = {
  hero: ["heading", "subheading", "ctaLabel"],
  image: ["caption"],
  gallery_images: ["caption"],
  cta: ["label"],
};
const BLOCK_JSONB = { rich_text: ["content"] };

// 1) Add the new (correctly-named) columns.
const addStatements = [
  ...localeCols("posts", ["title", "excerpt"]),
  ...localeCols("_posts_v", ["title", "excerpt"], { versioned: true }),
  ...localeCols("pages", ["title", "navLabel", "metaTitle", "metaDescription"]),
  ...localeCols("_pages_v", ["title", "navLabel", "metaTitle", "metaDescription"], { versioned: true }),
  ...localeCols("media", ["alt"]),
  ...localeCols("site_menu", ["label"]),
];
for (const prefix of BLOCK_PREFIXES) {
  for (const [type, bases] of Object.entries(BLOCK_VARCHAR)) {
    addStatements.push(...localeCols(`${prefix}_${type}`, bases, { type: "varchar" }));
  }
  for (const [type, bases] of Object.entries(BLOCK_JSONB)) {
    addStatements.push(...localeCols(`${prefix}_${type}`, bases, { type: "jsonb" }));
  }
}

// 2) Drop the mis-named columns created by the earlier version of this script.
const dropStatements = [];
const dropSpec = [
  { table: "pages", cols: ["nav_label", "meta_title", "meta_description"], versioned: false },
  { table: "_pages_v", cols: ["nav_label", "meta_title", "meta_description"], versioned: true },
];
for (const prefix of BLOCK_PREFIXES) {
  dropSpec.push({ table: `${prefix}_hero`, cols: ["cta_label"], versioned: false });
}
for (const { table, cols, versioned } of dropSpec) {
  for (const col of cols) {
    for (const loc of LOCALES) {
      const name = `${versioned ? "version_" : ""}${col}_${loc}`;
      dropStatements.push(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "${name}";`);
    }
  }
}

// 3) Copy data from each old `*_locales` table into the new columns.
const backfills = [
  { target: "posts", source: "posts_locales", bases: ["title", "excerpt"] },
  { target: "pages", source: "pages_locales", bases: ["title", "navLabel", "metaTitle", "metaDescription"] },
  { target: "media", source: "media_locales", bases: ["alt"] },
  { target: "site_menu", source: "site_menu_locales", bases: ["label"] },
];
const blockBases = {
  hero: ["heading", "subheading", "ctaLabel"],
  rich_text: ["content"],
  image: ["caption"],
  gallery_images: ["caption"],
  cta: ["label"],
};
for (const prefix of BLOCK_PREFIXES) {
  for (const [type, bases] of Object.entries(blockBases)) {
    const table = `${prefix}_${type}`;
    backfills.push({ target: table, source: `${table}_locales`, bases });
  }
}

async function run() {
  for (const statement of addStatements) await pool.query(statement);
  console.log(`Ensured ${addStatements.length} per-locale columns.`);

  for (const statement of dropStatements) {
    try {
      await pool.query(statement);
    } catch (err) {
      console.error(`  drop skipped: ${err.message}`);
    }
  }
  console.log(`Dropped ${dropStatements.length} mis-named columns (if present).`);

  let copied = 0;
  for (const { target, source, bases } of backfills) {
    for (const loc of LOCALES) {
      const setClause = bases.map((b) => `"${targetCol(b, loc)}" = l."${camelToSnake(b)}"`).join(", ");
      const guard = bases.map((b) => `p."${targetCol(b, loc)}" IS NULL`).join(" AND ");
      const sql = `UPDATE "${target}" p SET ${setClause}
        FROM "${source}" l
        WHERE l."_parent_id" = p."id" AND l."_locale" = '${loc}' AND (${guard});`;
      try {
        const res = await pool.query(sql);
        copied += res.rowCount ?? 0;
      } catch (err) {
        console.error(`  skip ${target} <- ${source} (${loc}): ${err.message}`);
      }
    }
  }
  console.log(`Backfill complete. Filled ${copied} rows.`);
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
