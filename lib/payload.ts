import { cookies } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/i18n/config";

export async function getPayloadClient() {
  return getPayload({ config });
}

/**
 * Raw node-postgres pool from the Payload Postgres adapter. Used for the few
 * operations Payload's Local API can't express atomically (conditional
 * inventory decrements, SUM aggregates for the dashboard).
 */
export async function getPgPool() {
  const payload = await getPayloadClient();
  const pool = (payload.db as unknown as { pool?: import("pg").Pool }).pool;
  if (!pool) {
    throw new Error("Postgres pool is not available on the Payload adapter.");
  }
  return pool;
}

/**
 * Resolve the active locale from the same cookie next-intl uses, so Payload
 * content is fetched in the language the visitor selected.
 */
export async function getCurrentLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(localeCookieName)?.value;
  return isLocale(value) ? value : defaultLocale;
}
