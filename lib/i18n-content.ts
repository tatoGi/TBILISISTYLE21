/**
 * Helpers for CMS content that is translated via on-screen language tabs.
 *
 * Localized content was moved off Payload's native localization (one locale at
 * a time, via the header switcher) onto flat per-locale columns named
 * `<field>_<locale>` (e.g. `title_ka`, `title_en`). This lets all four
 * languages be edited together in tabs. The frontend reads them with `pickField`
 * below, falling back to Georgian (`ka`) when a translation is empty.
 *
 * See fields/localeTabs.ts (admin schema) and the matching migration + the
 * ensureSchema()/backfill steps in instrumentation.ts.
 */

export const CONTENT_LOCALES = ["ka", "en", "ru", "ua"] as const;
export type ContentLocale = (typeof CONTENT_LOCALES)[number];
export const CONTENT_FALLBACK_LOCALE: ContentLocale = "ka";

/**
 * Read a per-locale suffixed field from a Payload doc with a `ka` fallback.
 * Example: pickField(post, "title", "en") -> post.title_en ?? post.title_ka.
 */
export function pickField<T = unknown>(
  doc: Record<string, unknown> | null | undefined,
  base: string,
  locale: string,
): T | undefined {
  if (!doc) return undefined;
  const value = doc[`${base}_${locale}`];
  if (value !== undefined && value !== null && value !== "") {
    return value as T;
  }
  const fallback = doc[`${base}_${CONTENT_FALLBACK_LOCALE}`];
  return (fallback === null ? undefined : fallback) as T | undefined;
}

/**
 * Variant of {@link pickField} for fields built with `localeTabsKeepBase`, where
 * the Georgian value lives in the *un-suffixed* base column (`title`) and only
 * en/ru/ua are suffixed (`title_en`). Reads `<base>_<locale>` and falls back to
 * the base column. Example: pickLocalized(ticket, "title", "en")
 * -> ticket.title_en ?? ticket.title.
 */
export function pickLocalized<T = unknown>(
  doc: Record<string, unknown> | null | undefined,
  base: string,
  locale: string,
): T | undefined {
  if (!doc) return undefined;
  if (locale !== CONTENT_FALLBACK_LOCALE) {
    const value = doc[`${base}_${locale}`];
    if (value !== undefined && value !== null && value !== "") {
      return value as T;
    }
  }
  const fallback = doc[base];
  return (fallback === null ? undefined : fallback) as T | undefined;
}
