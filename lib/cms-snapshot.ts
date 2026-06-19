/** Shared helpers for manual local → production CMS content push. */

export const SNAPSHOT_PATH = "scripts/.cms-snapshot.json";

/** CMS collections safe to push manually. Never includes orders, users, etc. */
export const PUSHABLE_COLLECTIONS = [
  "media",
  "pages",
  "posts",
  "partners",
  "products",
  "tickets",
  "musicTracks",
] as const;

export type PushableCollection = (typeof PUSHABLE_COLLECTIONS)[number];

/** Optional pseudo-target for site global settings. */
export type ImportTarget = PushableCollection | "site";

export type SnapshotEnvelope = {
  exportedAt: string;
  sourceHost: string;
  collections: Record<PushableCollection, SnapshotItem[]>;
  global: { site: Record<string, unknown> | null };
};

export type SnapshotItem = {
  localId: string;
  key: string;
  data: Record<string, unknown>;
};

const SYSTEM_KEYS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "sizes",
  "_uuid",
  "deletedAt",
  "lockUntil",
]);

/** Strip Payload system fields before create/update on another DB. */
export function stripSystemFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => stripSystemFields(v)) as T;
  }
  if (!value || typeof value !== "object") return value;

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SYSTEM_KEYS.has(k)) continue;
    out[k] = stripSystemFields(v);
  }
  return out as T;
}

/** Replace local relationship UUIDs with production IDs. */
export function remapIds<T>(value: T, idMap: Map<string, string>): T {
  if (typeof value === "string") {
    return (idMap.has(value) ? idMap.get(value)! : value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => remapIds(v, idMap)) as T;
  }
  if (!value || typeof value !== "object") return value;

  const obj = value as Record<string, unknown>;
  if (typeof obj.id === "string" && idMap.has(obj.id) && Object.keys(obj).length <= 2) {
    return { ...obj, id: idMap.get(obj.id)! } as T;
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = remapIds(v, idMap);
  }
  return out as T;
}

/** Site global fields we copy from local → prod. Prod-only flags are left alone. */
export function pickSiteImportFields(site: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(site)) {
    if (k === "acknowledgedTicketTier") continue;
    // Keep prod background music when the local snapshot has none.
    if (k === "backgroundMusic" && (v == null || v === "")) continue;
    out[k] = v;
  }
  return out;
}

export function parseOnlyFlag(argv: string[]): ImportTarget[] | null {
  const raw = argv.find((a) => a.startsWith("--only="))?.slice("--only=".length);
  if (!raw) return null;
  const allowed = [...PUSHABLE_COLLECTIONS, "site"] as const;
  const parts = raw.split(",").map((s) => s.trim()) as ImportTarget[];
  for (const p of parts) {
    if (!allowed.includes(p as (typeof allowed)[number])) {
      throw new Error(`Unknown target "${p}". Allowed: ${allowed.join(", ")}`);
    }
  }
  return parts;
}

export function dbHost(connectionString: string): string {
  return connectionString.replace(/^.*@/, "").replace(/\/.*$/, "") || "(unknown)";
}
