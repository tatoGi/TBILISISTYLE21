import { revalidateTag } from "next/cache";

/** Bust frontend caches after CMS edits (Payload hooks / admin actions). */
export function revalidateMusicTracksCache() {
  try {
    revalidateTag("music-tracks");
  } catch {
    /* outside Next.js request context */
  }
}

export function revalidateSiteCache() {
  try {
    revalidateTag("site");
  } catch {
    /* outside Next.js request context */
  }
}
