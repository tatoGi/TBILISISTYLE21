/**
 * Manual CMS content push: local DB → JSON snapshot → production DB.
 *
 * This NEVER runs on deploy or server boot. You run it explicitly when you
 * want to copy editor content to Neon/Vercel.
 *
 * Step 1 — export from LOCAL (uses DATABASE_URL in .env.local):
 *   npx payload run scripts/push-cms-content.ts export
 *
 * Step 2 — review scripts/.cms-snapshot.json, then import to PRODUCTION:
 *   $env:DATABASE_URL=""
 *   $env:POSTGRES_URL="<neon pooled url>"
 *   $env:BLOB_READ_WRITE_TOKEN="<vercel blob token>"
 *   npx payload run scripts/push-cms-content.ts import --confirm
 *
 * Dry-run (shows what would change, writes nothing):
 *   npx payload run scripts/push-cms-content.ts import --dry
 *
 * Partial sync:
 *   ... export --only=pages,posts,partners,site
 *   ... import --only=pages,posts --confirm
 *
 * Skipped always: users, orders, sold tickets, joker tickets, message jobs.
 * Existing prod rows are updated by slug/name/filename (upsert), never deleted.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { getPayload } from "payload";
import config from "@payload-config";

import {
  SNAPSHOT_PATH,
  PUSHABLE_COLLECTIONS,
  type PushableCollection,
  type SnapshotEnvelope,
  type SnapshotItem,
  stripSystemFields,
  remapIds,
  pickSiteImportFields,
  parseOnlyFlag,
  dbHost,
} from "../lib/cms-snapshot";

const argv = process.argv.slice(2);
const mode = argv.find((a) => a === "export" || a === "import");
const DRY = argv.includes("--dry");
const CONFIRM = argv.includes("--confirm");
const only = parseOnlyFlag(argv);
const MEDIA_DIR = path.resolve(process.cwd(), "public/media");

function wants(collection: PushableCollection | "site"): boolean {
  if (!only) return true;
  return only.includes(collection);
}

function relId(doc: { id?: unknown }): string {
  return String(doc.id);
}

function itemKey(collection: PushableCollection, doc: Record<string, unknown>): string {
  if (collection === "media") return String(doc.filename ?? "");
  if (collection === "pages" || collection === "posts") return String(doc.slug ?? "");
  if (collection === "partners") return String(doc.name ?? "");
  if (collection === "products" || collection === "tickets") return String(doc.title ?? "");
  if (collection === "musicTracks") return String(doc.title ?? "");
  return relId(doc as { id?: unknown });
}

type MediaMaps = {
  byFilename: Map<string, string>;
  byBasename: Map<string, string[]>;
};

function resolveMediaRef(
  ref: unknown,
  maps: MediaMaps,
  idMap: Map<string, string>,
): string | null {
  if (typeof ref === "string") {
    return idMap.get(ref) ?? maps.byFilename.get(ref) ?? ref;
  }
  if (!ref || typeof ref !== "object") return null;
  const obj = ref as Record<string, unknown>;
  if (typeof obj.id === "string") {
    return idMap.get(obj.id) ?? maps.byFilename.get(obj.id) ?? null;
  }
  if (typeof obj.filename === "string") {
    return resolveProdMediaId(obj.filename, maps.byFilename, maps.byBasename) ?? null;
  }
  return null;
}

function normalizeBlock(block: unknown, maps: MediaMaps, idMap: Map<string, string>): unknown {
  if (!block || typeof block !== "object") return block;
  const b = { ...(block as Record<string, unknown>) };

  if (b.image) {
    const id = resolveMediaRef(b.image, maps, idMap);
    if (id) b.image = id;
  }
  if (Array.isArray(b.images)) {
    b.images = b.images.map((row) => {
      if (!row || typeof row !== "object") return row;
      const r = { ...(row as Record<string, unknown>) };
      if (r.image) {
        const id = resolveMediaRef(r.image, maps, idMap);
        if (id) r.image = id;
      }
      return r;
    });
  }
  return b;
}

function prepareImportData(
  data: Record<string, unknown>,
  maps: MediaMaps,
  idMap: Map<string, string>,
): Record<string, unknown> {
  const out = remapIds(stripSystemFields(data), idMap) as Record<string, unknown>;

  if (Array.isArray(out.layout)) {
    out.layout = out.layout.map((b) => normalizeBlock(b, maps, idMap));
  }

  for (const field of ["logo", "image", "backgroundMusic", "coverImage", "audioFile"]) {
    if (out[field]) {
      const id = resolveMediaRef(out[field], maps, idMap);
      if (id) out[field] = id;
    }
  }

  if (Array.isArray(out.menu)) {
    out.menu = out.menu.map((row) => {
      if (!row || typeof row !== "object") return row;
      const r = { ...(row as Record<string, unknown>) };
      if (r.page && typeof r.page === "object") {
        const pageId = (r.page as { id?: string }).id;
        if (pageId && idMap.has(pageId)) r.page = idMap.get(pageId);
      }
      return r;
    });
  }

  // Draft exports sometimes omit title_ka; keep Payload validation happy.
  if (!out.title_ka && typeof out.title === "string") out.title_ka = out.title;
  if (!out.title_ka && typeof out.title_en === "string") out.title_ka = out.title_en;
  if (!out.title_ka && typeof out.slug === "string") {
    out.title_ka = out.slug.replace(/-/g, " ");
  }

  return out;
}

async function exportSnapshot() {
  const payload = await getPayload({ config });
  const sourceHost = dbHost(process.env.DATABASE_URL || process.env.POSTGRES_URL || "");

  const collections = {} as SnapshotEnvelope["collections"];
  for (const slug of PUSHABLE_COLLECTIONS) {
    if (!wants(slug)) {
      collections[slug] = [];
      continue;
    }
    const { docs } = await payload.find({
      collection: slug,
      limit: 0,
      depth: 2,
      pagination: false,
      draft: false,
      ...(slug === "pages" || slug === "posts"
        ? { where: { _status: { equals: "published" } } }
        : {}),
    });
    collections[slug] = docs.map((doc) => {
      const data = doc as Record<string, unknown>;
      return {
        localId: relId(doc),
        key: itemKey(slug, data),
        data: stripSystemFields(data),
      } satisfies SnapshotItem;
    });
    console.error(`[export] ${slug}: ${collections[slug].length} docs`);
  }

  let site: Record<string, unknown> | null = null;
  if (wants("site")) {
    site = stripSystemFields(
      (await payload.findGlobal({ slug: "site", depth: 2 })) as Record<string, unknown>,
    );
    console.error("[export] site: global settings");
  }

  const envelope: SnapshotEnvelope = {
    exportedAt: new Date().toISOString(),
    sourceHost,
    collections,
    global: { site },
  };

  writeFileSync(SNAPSHOT_PATH, JSON.stringify(envelope, null, 2), "utf8");
  console.error(`[export] wrote ${SNAPSHOT_PATH} (source: ${sourceHost})`);
}

function mediaBasename(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const stem = dot >= 0 ? filename.slice(0, dot) : filename;
  return stem.replace(/-\d+$/, "");
}

async function loadProdMediaByFilename(
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<{ byFilename: Map<string, string>; byBasename: Map<string, string[]> }> {
  const { docs } = await payload.find({
    collection: "media",
    limit: 0,
    depth: 0,
    pagination: false,
  });
  const byFilename = new Map<string, string>();
  const byBasename = new Map<string, string[]>();
  for (const doc of docs) {
    const fn = (doc as { filename?: string }).filename;
    if (!fn) continue;
    const id = relId(doc);
    byFilename.set(fn, id);
    const base = mediaBasename(fn);
    const list = byBasename.get(base) ?? [];
    list.push(id);
    byBasename.set(base, list);
  }
  console.error(`[import] prod media files on target: ${byFilename.size}`);
  return { byFilename, byBasename };
}

function resolveProdMediaId(
  filename: string,
  byFilename: Map<string, string>,
  byBasename: Map<string, string[]>,
): string | undefined {
  const exact = byFilename.get(filename);
  if (exact) return exact;
  const base = mediaBasename(filename);
  const candidates = byBasename.get(base);
  return candidates?.[0];
}

async function findExisting(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: PushableCollection,
  item: SnapshotItem,
) {
  if (collection === "media" && item.key) {
    const found = await payload.find({
      collection: "media",
      where: { filename: { equals: item.key } },
      limit: 1,
      depth: 0,
    });
    return found.docs[0] ?? null;
  }
  if ((collection === "pages" || collection === "posts") && item.key) {
    const found = await payload.find({
      collection,
      where: { slug: { equals: item.key } },
      limit: 1,
      depth: 0,
    });
    return found.docs[0] ?? null;
  }
  if (collection === "partners" && item.key) {
    const found = await payload.find({
      collection: "partners",
      where: { name: { equals: item.key } },
      limit: 1,
      depth: 0,
    });
    return found.docs[0] ?? null;
  }
  if ((collection === "products" || collection === "tickets") && item.key) {
    const found = await payload.find({
      collection,
      where: { title: { equals: item.key } },
      limit: 1,
      depth: 0,
    });
    return found.docs[0] ?? null;
  }
  if (collection === "musicTracks" && item.key) {
    const found = await payload.find({
      collection: "musicTracks",
      where: { title: { equals: item.key } },
      limit: 1,
      depth: 0,
    });
    return found.docs[0] ?? null;
  }
  return null;
}

async function importSnapshot() {
  if (!CONFIRM && !DRY) {
    console.error(
      "[import] Refusing to write without --confirm. Run with --dry first to preview, then --confirm.",
    );
    process.exit(1);
  }

  // `vercel env run` injects Neon vars, but `.env.local` is loaded afterwards and
  // its DATABASE_URL (localhost) wins in payload.config.ts — drop it for import.
  if (
    process.env.POSTGRES_URL &&
    /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || "")
  ) {
    delete process.env.DATABASE_URL;
  }

  const targetConn = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
  const targetHost = dbHost(targetConn);

  if (!targetConn) {
    console.error("[import] Set POSTGRES_URL to your Neon connection string (and clear DATABASE_URL).");
    process.exit(1);
  }

  if (/localhost|127\.0\.0\.1/.test(targetConn)) {
    console.error(
      "[import] Refusing to import into a local database. Point POSTGRES_URL at Neon production.",
    );
    process.exit(1);
  }

  if (!existsSync(SNAPSHOT_PATH)) {
    console.error(`[import] Missing ${SNAPSHOT_PATH}. Run export first.`);
    process.exit(1);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN && !DRY) {
    console.error(
      "[import] BLOB_READ_WRITE_TOKEN is not set — media uploads need Vercel Blob on production.",
    );
    process.exit(1);
  }

  const envelope = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8")) as SnapshotEnvelope;
  console.error(
    `[import] snapshot from ${envelope.sourceHost} (${envelope.exportedAt}) → ${targetHost}${DRY ? " [dry]" : ""}`,
  );

  const payload = await getPayload({ config });
  const idMap = new Map<string, string>();
  let mediaMaps: MediaMaps = { byFilename: new Map(), byBasename: new Map() };

  const needsMediaMap =
    wants("media") ||
    wants("site") ||
    (["pages", "posts", "partners", "products", "tickets", "musicTracks"] as const).some((c) => wants(c));

  // 1. Media — map local IDs to prod IDs (upload only when "media" is in --only).
  if (needsMediaMap) {
    const loaded = await loadProdMediaByFilename(payload);
    mediaMaps = loaded;
    const { byFilename: prodByFilename, byBasename: prodByBasename } = loaded;

    for (const item of envelope.collections.media) {
      const filename = item.key || String(item.data.filename ?? "");
      const filePath = filename ? path.join(MEDIA_DIR, filename) : "";
      const hasFile = filePath && existsSync(filePath);
      let prodId = resolveProdMediaId(filename, prodByFilename, prodByBasename);

      if (prodId) {
        idMap.set(item.localId, prodId);
      } else if (!wants("media") && hasFile && !DRY) {
        // Content-only pass: upload any snapshot media still missing on prod.
        const created = await payload.create({
          collection: "media",
          filePath,
          data: {
            alt_ka: item.data.alt_ka,
            alt_en: item.data.alt_en,
            alt_ru: item.data.alt_ru,
            alt_ua: item.data.alt_ua,
          } as never,
        });
        prodId = relId(created);
        idMap.set(item.localId, prodId);
        const createdName = (created as { filename?: string }).filename ?? filename;
        prodByFilename.set(createdName, prodId);
        const base = mediaBasename(createdName);
        const list = prodByBasename.get(base) ?? [];
        list.push(prodId);
        prodByBasename.set(base, list);
        console.error(`[import] media: gap-fill created ${createdName}`);
      } else if (!wants("media")) {
        console.error(`[import] media: no prod match for ${filename}`);
        continue;
      }

      if (!wants("media")) continue;

      const existing = prodId
        ? { id: prodId }
        : await findExisting(payload, "media", item);

      if (existing) {
        idMap.set(item.localId, relId(existing));
        const altData = {
          alt_ka: item.data.alt_ka,
          alt_en: item.data.alt_en,
          alt_ru: item.data.alt_ru,
          alt_ua: item.data.alt_ua,
        };
        if (DRY) {
          console.error(`[import] media: update alt ${filename}`);
        } else if (hasFile) {
          await payload.update({
            collection: "media",
            id: existing.id,
            data: altData,
            filePath,
          });
          console.error(`[import] media: refreshed ${filename}`);
        } else {
          await payload.update({ collection: "media", id: existing.id, data: altData });
          console.error(`[import] media: updated alt only ${filename}`);
        }
        continue;
      }

      if (!hasFile) {
        console.error(`[import] media: SKIP missing file on disk ${filename}`);
        continue;
      }

      if (DRY) {
        console.error(`[import] media: create ${filename}`);
        idMap.set(item.localId, `dry-${item.localId}`);
        continue;
      }

      const created = await payload.create({
        collection: "media",
        filePath,
        data: {
          alt_ka: item.data.alt_ka,
          alt_en: item.data.alt_en,
          alt_ru: item.data.alt_ru,
          alt_ua: item.data.alt_ua,
        } as never,
      });
      idMap.set(item.localId, relId(created));
      console.error(`[import] media: created ${filename}`);
    }
  }

  // 2. Pages, posts, partners, products, tickets — upsert by stable key.
  const contentCollections = ["pages", "posts", "partners", "products", "tickets", "musicTracks"] as const;
  for (const collection of contentCollections) {
    if (!wants(collection)) continue;
    for (const item of envelope.collections[collection]) {
      const data = prepareImportData(item.data, mediaMaps, idMap);
      const existing = await findExisting(payload, collection, item);

      if (DRY) {
        console.error(
          `[import] ${collection}: ${existing ? "update" : "create"} ${item.key || item.localId}`,
        );
        if (collection === "pages" || collection === "posts") {
          idMap.set(item.localId, existing ? relId(existing) : `dry-${item.localId}`);
        }
        continue;
      }

      if (existing) {
        await payload.update({
          collection,
          id: existing.id,
          data: data as never,
          draft: false,
        });
        idMap.set(item.localId, relId(existing));
        console.error(`[import] ${collection}: updated ${item.key}`);
      } else {
        const created = await payload.create({
          collection,
          data: data as never,
          draft: false,
        });
        idMap.set(item.localId, relId(created));
        console.error(`[import] ${collection}: created ${item.key}`);
      }
    }
  }

  // 3. Site settings — merge content fields, keep prod-only flags.
  if (wants("site") && envelope.global.site) {
    const siteData = prepareImportData(pickSiteImportFields(envelope.global.site), mediaMaps, idMap);
    if (DRY) {
      console.error("[import] site: update global settings");
    } else {
      await payload.updateGlobal({ slug: "site", data: siteData as never });
      console.error("[import] site: updated global settings");
    }
  }

  console.error(`[import] done${DRY ? " (dry run — no writes)" : ""}`);
}

if (mode === "export") {
  await exportSnapshot();
} else if (mode === "import") {
  await importSnapshot();
} else {
  console.error("Usage: npx payload run scripts/push-cms-content.ts <export|import> [--dry] [--confirm] [--only=...]");
  process.exit(1);
}

process.exit(0);
