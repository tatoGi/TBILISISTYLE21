import type { Field, TabsField } from "payload";

/**
 * Builds an unnamed `tabs` field with one tab per locale (ka/en/ru/ua). Each
 * tab holds the given fields with their names suffixed `_<locale>` so a `title`
 * field becomes `title_ka`, `title_en`, `title_ru`, `title_ua`.
 *
 * Why suffixed top-level fields instead of Payload localization:
 *  - All four languages are editable at once (tabs), no header locale switcher.
 *  - Unnamed tabs hoist their fields to the top level, so `useAsTitle` and flat
 *    DB columns keep working (named tabs/groups would nest the data).
 *  - Only the `ka` (fallback) tab keeps `required`, so editors are never forced
 *    to translate into every language.
 *
 * Read these back on the frontend with `pickField` from lib/i18n-content.ts.
 */

const LOCALE_TABS: { code: string; label: string }[] = [
  { code: "ka", label: "ქართული" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "ua", label: "Українська" },
];

export type LocalizedFieldDef = {
  name: string;
  type: "text" | "textarea" | "richText";
  required?: boolean;
  label?: string;
};

export function localeTabs(fields: LocalizedFieldDef[]): TabsField {
  return {
    type: "tabs",
    tabs: LOCALE_TABS.map(({ code, label }) => ({
      label,
      fields: fields.map((field) => buildLocaleField(field, code)),
    })),
  };
}

function buildLocaleField(field: LocalizedFieldDef, code: string): Field {
  const base = {
    name: `${field.name}_${code}`,
    ...(field.label ? { label: `${field.label} (${code.toUpperCase()})` } : {}),
    ...(code === "ka" && field.required ? { required: true } : {}),
  };
  return { ...base, type: field.type } as Field;
}
