import { writeFileSync, existsSync } from "fs";
import path from "path";
import { getPayload } from "payload";
import config from "@payload-config";

import ka from "../messages/ka.json";
import en from "../messages/en.json";
import ru from "../messages/ru.json";
import ua from "../messages/ua.json";

const RESULT = path.resolve(process.cwd(), "scripts/.seed-result.txt");
const out: string[] = [];
const log = (m: string) => out.push(m);

type Locale = "ka" | "en" | "ru" | "ua";
const localeData: Record<Locale, Record<string, unknown>> = {
  ka: ka as never,
  en: en as never,
  ru: ru as never,
  ua: ua as never,
};
const otherLocales: Locale[] = ["en", "ru", "ua"];

type PageDef = {
  slug: string;
  key: string;
  titleField?: string;
  fallbackTitle: string;
  top?: string[]; // image paths relative to /public, shown above the text
  bottom?: string[]; // shown below the text
  gallery?: string[]; // shown as a gallery below the text
  featured?: boolean; // show on the homepage
  /** Functional page that lives at a fixed React route — menus link here, no content migrated. */
  routePath?: string;
  /** When set, the title comes from messages `nav.<navKey>` instead of a content object. */
  navKey?: string;
};

const pageMap: PageDef[] = [
  { slug: "main-stage", key: "mainStage", fallbackTitle: "Main Stage", featured: true, top: ["images/mainstage11.jpeg"], bottom: ["images/mainstage22.jpeg"] },
  { slug: "qvevri-stage", key: "qvevriStage", fallbackTitle: "Qvevri Stage", featured: true, top: ["images/qvevriStage2.jpeg"], bottom: ["images/qvevriStage1.jpeg"] },
  { slug: "techno-qvevri", key: "technoQvevri", fallbackTitle: "Techno Qvevri", featured: true, top: ["images/technoqvevri.jpeg"] },
  { slug: "line-up", key: "lineUp", titleField: "festivalTitle", fallbackTitle: "Line Up", gallery: ["lineups/tbilisistyleday1.jpeg", "lineups/tbilisistyleday2.jpeg", "lineups/tbilisistyleday3.jpeg", "lineups/rave.jpeg"] },
  { slug: "joker-ticket", key: "jokerTicket", fallbackTitle: "Joker Ticket", featured: true, top: ["images/joker1.jpeg"], bottom: ["images/joker2.jpeg"] },
  { slug: "ukrainian-day", key: "ukrainianDay", fallbackTitle: "Ukrainian Day", featured: true, top: ["images/ukrainianday.jpeg"] },
  { slug: "four-stages", key: "fourStages", fallbackTitle: "4 Stages" },
  { slug: "our-story", key: "ourStory", fallbackTitle: "Our Story" },
  { slug: "mission", key: "mission", fallbackTitle: "Mission", featured: true, top: ["images/mission.jpeg"] },
  { slug: "food-zone", key: "foodZone", fallbackTitle: "Food Zone", top: ["images/foodzone1.jpeg"], bottom: ["images/foodzone2.jpeg"] },
  { slug: "contact-us", key: "contactUs", fallbackTitle: "Contact Us" },
  { slug: "rules-and-terms", key: "rulesAndTerms", fallbackTitle: "Rules & Terms" },
  // Functional pages: discoverable in Pages + menu, but link to their React route.
  { slug: "shop", key: "shop", navKey: "shop", fallbackTitle: "Shop", routePath: "/dashboard/shop", featured: true },
  { slug: "tickets", key: "ticket", navKey: "ticket", fallbackTitle: "Tickets", routePath: "/dashboard/tickets", featured: true },
];

function getContent(loc: Locale, key: string): Record<string, unknown> | null {
  const v = localeData[loc]?.[key];
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function navTitle(loc: Locale, navKey: string): string {
  const nav = localeData[loc]?.nav as Record<string, string> | undefined;
  const v = nav?.[navKey];
  return typeof v === "string" && v.trim() ? v.trim() : "";
}

function titleFor(content: Record<string, unknown> | null, titleField: string, fallback: string): string {
  if (!content) return fallback;
  const t = content[titleField] ?? content.title;
  return typeof t === "string" && t.trim() ? t.trim() : fallback;
}

function paragraphsFor(content: Record<string, unknown> | null, titleField: string): string[] {
  if (!content) return [];
  const paras: string[] = [];
  for (const [k, v] of Object.entries(content)) {
    if (k === titleField || k === "title") continue;
    if (typeof v === "string" && v.trim()) {
      for (const line of v.split(/\n+/)) {
        const t = line.trim();
        if (t) paras.push(t);
      }
    }
  }
  return paras;
}

function lexical(paragraphs: string[]) {
  const children = paragraphs.map((text) => ({
    type: "paragraph", version: 1, format: "", indent: 0, direction: "ltr", textFormat: 0,
    children: [{ type: "text", text, version: 1, format: 0, mode: "normal", style: "", detail: 0 }],
  }));
  if (!children.length) {
    children.push({ type: "paragraph", version: 1, format: "", indent: 0, direction: "ltr", textFormat: 0, children: [] });
  }
  return { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children } };
}

try {
  const payload = await getPayload({ config });
  const mediaCache = new Map<string, string>();
  let navOrder = 0;

  async function ensureMedia(rel: string): Promise<string | null> {
    if (mediaCache.has(rel)) return mediaCache.get(rel)!;
    const filename = rel.split("/").pop()!;
    const abs = path.resolve("public", rel);
    if (!existsSync(abs)) {
      log(`  ! missing image ${rel}`);
      return null;
    }
    const found = await payload.find({ collection: "media", where: { filename: { equals: filename } }, limit: 1, depth: 0 });
    let id: string;
    if (found.docs[0]) {
      id = String(found.docs[0].id);
    } else {
      const created = await payload.create({ collection: "media", filePath: abs, data: { alt_ka: filename } as never });
      id = String(created.id);
    }
    mediaCache.set(rel, id);
    return id;
  }

  for (const def of pageMap) {
    const { slug, key, titleField = "title", fallbackTitle } = def;
    const kaContent = getContent("ka", key);
    const kaTitle = def.navKey
      ? navTitle("ka", def.navKey) || fallbackTitle
      : titleFor(kaContent, titleField, fallbackTitle);

    // Resolve image ids
    const topIds = (await Promise.all((def.top ?? []).map(ensureMedia))).filter(Boolean) as string[];
    const bottomIds = (await Promise.all((def.bottom ?? []).map(ensureMedia))).filter(Boolean) as string[];
    const galleryIds = (await Promise.all((def.gallery ?? []).map(ensureMedia))).filter(Boolean) as string[];

    // Build layout. Functional pages (shop/tickets) just need a valid block so
    // they exist in Pages + menu; their real UI lives at `routePath`. Content
    // pages get: top images → text → bottom images → gallery.
    // Content is now stored as flat per-locale fields (title_ka, heading_en, …)
    // instead of Payload localization, so build every language into one doc.
    const layout: Record<string, unknown>[] = [];
    if (def.routePath) {
      const hero: Record<string, unknown> = { blockType: "hero", heading_ka: kaTitle };
      for (const loc of otherLocales) {
        hero[`heading_${loc}`] = def.navKey ? navTitle(loc, def.navKey) || kaTitle : kaTitle;
      }
      layout.push(hero);
    } else {
      for (const id of topIds) layout.push({ blockType: "image", image: id, width: "full" });
      const rich: Record<string, unknown> = {
        blockType: "richText",
        content_ka: lexical(paragraphsFor(kaContent, titleField)),
      };
      for (const loc of otherLocales) {
        rich[`content_${loc}`] = lexical(paragraphsFor(getContent(loc, key), titleField));
      }
      layout.push(rich);
      for (const id of bottomIds) layout.push({ blockType: "image", image: id, width: "full" });
      if (galleryIds.length) layout.push({ blockType: "gallery", columns: "3", images: galleryIds.map((id) => ({ image: id })) });
    }

    navOrder += 10;
    const existing = await payload.find({ collection: "pages", where: { slug: { equals: slug } }, depth: 0, limit: 1 });
    const existingDoc = existing.docs[0] as { id: string } | undefined;
    const data: Record<string, unknown> = {
      slug,
      title_ka: kaTitle,
      _status: "published",
      showInNav: true,
      navOrder,
      featuredOnHome: !!def.featured,
      ...(def.routePath ? { routePath: def.routePath } : {}),
      layout,
    };
    for (const loc of otherLocales) {
      data[`title_${loc}`] = def.navKey
        ? navTitle(loc, def.navKey) || kaTitle
        : titleFor(getContent(loc, key), titleField, kaTitle);
    }

    if (existingDoc) {
      await payload.update({ collection: "pages", id: existingDoc.id, data: data as never });
    } else {
      await payload.create({ collection: "pages", data: data as never });
    }

    const imgCount = topIds.length + bottomIds.length + galleryIds.length;
    log(`${existingDoc ? "updated" : "created"}  /${slug}  (${imgCount} images)`);
  }

  log(`\nDone. ${pageMap.length} pages, images uploaded to Media.`);
  writeFileSync(RESULT, out.join("\n"));
} catch (e) {
  writeFileSync(RESULT, "ERR: " + (e instanceof Error ? (e.stack ?? e.message) : String(e)) + "\n" + out.join("\n"));
}
