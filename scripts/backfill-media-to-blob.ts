/**
 * Backfill existing media files into Vercel Blob.
 *
 * Why: media docs were migrated to the production DB, but the actual files only
 * ever lived on local disk (public/media, gitignored). With Vercel Blob enabled
 * the production records point at files that were never uploaded → broken images.
 *
 * What it does: for every media document it finds the ORIGINAL file on local
 * disk and re-uploads it through Payload, which pushes the original + all
 * imageSizes to Blob and rewrites the doc's url(s).
 *
 * Run (against PRODUCTION — point env at the Neon/Vercel DB + the Blob store):
 *   POSTGRES_URL="<neon prod url>" \
 *   BLOB_READ_WRITE_TOKEN="<vercel blob token>" \
 *   npx payload run scripts/backfill-media-to-blob.ts
 *
 * Safe to re-run: it simply re-uploads each original again (idempotent on Blob).
 * Pass `--dry` to only report what it would do.
 */
import { existsSync } from "fs";
import path from "path";
import { getPayload } from "payload";
import config from "@payload-config";

const DRY = process.argv.includes("--dry");
const MEDIA_DIR = path.resolve(process.cwd(), "public/media");

if (!process.env.BLOB_READ_WRITE_TOKEN && !DRY) {
  console.error(
    "[backfill] BLOB_READ_WRITE_TOKEN is not set — Blob storage is disabled, so " +
      "re-uploads would just write back to local disk. Set the token (and point " +
      "POSTGRES_URL at production) before running for real, or pass --dry.",
  );
  process.exit(1);
}

const payload = await getPayload({ config });

const { docs } = await payload.find({
  collection: "media",
  limit: 0, // 0 = no limit: fetch every media doc
  depth: 0,
  pagination: false,
});

let uploaded = 0;
let missing = 0;
let failed = 0;

for (const doc of docs) {
  const filename = (doc as { filename?: string }).filename;
  if (!filename) {
    console.error(`[backfill] doc ${doc.id} has no filename — skipped`);
    missing++;
    continue;
  }

  const filePath = path.join(MEDIA_DIR, filename);
  if (!existsSync(filePath)) {
    console.error(`[backfill] MISSING on disk: ${filename} (doc ${doc.id})`);
    missing++;
    continue;
  }

  if (DRY) {
    console.error(`[backfill] would upload: ${filename}`);
    uploaded++;
    continue;
  }

  try {
    // Passing filePath replaces the underlying file: Payload re-runs the upload
    // pipeline (Blob adapter + size regeneration) and rewrites the doc url(s).
    await payload.update({ collection: "media", id: doc.id, data: {}, filePath });
    console.error(`[backfill] uploaded: ${filename}`);
    uploaded++;
  } catch (err) {
    console.error(`[backfill] FAILED: ${filename} (doc ${doc.id})`, err);
    failed++;
  }
}

console.error(
  `[backfill] done — ${uploaded} ${DRY ? "to upload" : "uploaded"}, ` +
    `${missing} missing on disk, ${failed} failed (of ${docs.length} docs)`,
);

process.exit(failed > 0 ? 1 : 0);
