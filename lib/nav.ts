import { getTranslations } from "next-intl/server";
import { getCurrentLocale, getPayloadClient } from "@/lib/payload";

export type NavLink = { label: string; href: string };

type PageRef = { slug?: string; title?: string; navLabel?: string; routePath?: string };

function toLink(page: PageRef, override?: string): NavLink {
  const routePath = page.routePath?.trim();
  return {
    label: (override || page.navLabel || page.title || page.slug || "").toString(),
    href: routePath ? routePath : `/${page.slug}`,
  };
}

/**
 * Fixed feature pages that live at React routes (not Pages docs), so they never
 * surface through the menu global / showInNav fallback. Appended to every menu,
 * deduped by href, with labels from the `nav` translations.
 */
async function getFixedNavLinks(): Promise<NavLink[]> {
  const t = await getTranslations("nav");
  return [
    { label: t("news"), href: "/news" },
    { label: t("partners"), href: "/partners" },
  ];
}

function withFixedLinks(base: NavLink[], fixed: NavLink[]): NavLink[] {
  const seen = new Set(base.map((l) => l.href));
  return [...base, ...fixed.filter((l) => !seen.has(l.href))];
}

/**
 * Site menu — driven by the drag-sortable "Menu" global. Falls back to Pages
 * flagged "Show in site menu" (ordered by navOrder) if the menu is empty. News
 * and Partners (fixed routes) are always appended so they stay reachable.
 */
export async function getNavPages(): Promise<NavLink[]> {
  const fixed = await getFixedNavLinks().catch(() => [] as NavLink[]);
  try {
    const payload = await getPayloadClient();
    const locale = await getCurrentLocale();

    const site = await payload.findGlobal({ slug: "site", locale, fallbackLocale: "ka", depth: 1 });
    const menu = (site?.menu ?? []) as { page?: unknown; label?: string }[];
    const fromGlobal = menu
      .filter((i) => i.page && typeof i.page === "object")
      .map((i) => toLink(i.page as PageRef, i.label));
    if (fromGlobal.length) return withFixedLinks(fromGlobal, fixed);

    const res = await payload.find({
      collection: "pages",
      where: { showInNav: { equals: true }, _status: { equals: "published" } },
      locale,
      fallbackLocale: "ka",
      sort: "navOrder",
      depth: 0,
      limit: 100,
    });
    return withFixedLinks(res.docs.map((p) => toLink(p as PageRef)), fixed);
  } catch {
    return fixed;
  }
}

/** Homepage featured pages — Pages flagged "Feature on homepage". */
export async function getFeaturedPages(): Promise<NavLink[]> {
  try {
    const payload = await getPayloadClient();
    const locale = await getCurrentLocale();
    const res = await payload.find({
      collection: "pages",
      where: { featuredOnHome: { equals: true }, _status: { equals: "published" } },
      locale,
      fallbackLocale: "ka",
      sort: "navOrder",
      depth: 0,
      limit: 6,
    });
    return res.docs.map((p) => toLink(p as PageRef));
  } catch {
    return [];
  }
}

export type PartnerCard = { id: string; name: string; description: string | null; logoUrl: string | null; website: string | null };

function mediaUrlOf(media: unknown): string | null {
  if (media && typeof media === "object" && "url" in media) {
    return (media as { url?: string }).url ?? null;
  }
  return null;
}

/** Homepage/festival featured partners — partners flagged "Show on festival landing". */
export async function getFeaturedPartners(): Promise<PartnerCard[]> {
  try {
    const payload = await getPayloadClient();
    const locale = await getCurrentLocale();
    const res = await payload.find({
      collection: "partners",
      where: { featuredOnHome: { equals: true } },
      locale,
      fallbackLocale: "ka",
      sort: "order",
      depth: 1,
      limit: 12,
    });
    return res.docs.map((p) => ({
      id: p.id as string,
      name: (p.name as string) || "",
      description: (p.description as string)?.trim() || null,
      logoUrl: mediaUrlOf(p.logo),
      website: ((p.website as string)?.trim() || null),
    }));
  } catch {
    return [];
  }
}

export type NewsCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverUrl: string | null;
  publishedAt: string | null;
};

/** Admin-selected news for the festival landing — posts flagged "Feature on homepage". */
export async function getFeaturedNews(limit = 6): Promise<NewsCard[]> {
  try {
    const payload = await getPayloadClient();
    const locale = await getCurrentLocale();
    const res = await payload.find({
      collection: "posts",
      where: {
        featuredOnHome: { equals: true },
        _status: { equals: "published" },
      },
      locale,
      fallbackLocale: "ka",
      sort: "-publishedAt",
      depth: 1,
      limit,
    });
    return res.docs.map((p) => ({
      id: p.id as string,
      title: (p.title as string) || "",
      slug: (p.slug as string) || "",
      excerpt: (p.excerpt as string)?.trim() || null,
      coverUrl: mediaUrlOf(p.coverImage),
      publishedAt: (p.publishedAt as string) || null,
    }));
  } catch {
    return [];
  }
}
