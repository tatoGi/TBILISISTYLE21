import { unstable_cache } from "next/cache";
import { getTranslations } from "next-intl/server";
import { getCachedSiteGlobal, getCurrentLocale, getPayloadClient } from "@/lib/payload";
import { pickField, pickLocalized } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/config";

export type NavLink = { label: string; href: string };

type PageRef = Record<string, unknown> & { slug?: string; routePath?: string };

function toLink(page: PageRef, locale: string, override?: string): NavLink {
  const routePath = (page.routePath as string)?.trim();
  const navLabel = pickField<string>(page, "navLabel", locale);
  const title = pickField<string>(page, "title", locale);
  return {
    label: (override || navLabel || title || page.slug || "").toString(),
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
// Locale-dependent base menu (everything that hits Postgres). Cached per locale
// and revalidated every 5 min — the header runs on every page, so this was a
// per-request DB read site-wide. getFixedNavLinks (translations/cookies) stays
// outside the cache scope.
const fetchNavBase = unstable_cache(
  async (locale: Locale): Promise<NavLink[]> => {
    const payload = await getPayloadClient();

    const site = await payload.findGlobal({ slug: "site", locale, fallbackLocale: "ka", depth: 1 });
    const menu = (site?.menu ?? []) as Record<string, unknown>[];
    const fromGlobal = menu
      .filter((i) => i.page && typeof i.page === "object")
      .map((i) => toLink(i.page as PageRef, locale, pickField<string>(i, "label", locale)));
    if (fromGlobal.length) return fromGlobal;

    const res = await payload.find({
      collection: "pages",
      where: { showInNav: { equals: true }, _status: { equals: "published" } },
      locale,
      fallbackLocale: "ka",
      sort: "navOrder",
      depth: 0,
      limit: 100,
    });
    return res.docs.map((p) => toLink(p as unknown as PageRef, locale));
  },
  ["nav-base"],
  { revalidate: 300, tags: ["site", "pages"] },
);

export async function getNavPages(): Promise<NavLink[]> {
  const fixed = await getFixedNavLinks().catch(() => [] as NavLink[]);
  try {
    const locale = await getCurrentLocale();
    return withFixedLinks(await fetchNavBase(locale), fixed);
  } catch {
    return fixed;
  }
}

const fetchFeaturedPages = unstable_cache(
  async (locale: Locale): Promise<NavLink[]> => {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "pages",
      where: { featuredOnHome: { equals: true }, _status: { equals: "published" } },
      locale,
      fallbackLocale: "ka",
      sort: "navOrder",
      depth: 0,
      // Show every page flagged "Feature on homepage" — a low cap silently hid
      // pages past the 6th (by navOrder) even though their checkbox was on.
      limit: 24,
    });
    return res.docs.map((p) => toLink(p as unknown as PageRef, locale));
  },
  ["featured-pages"],
  { revalidate: 300, tags: ["pages"] },
);

/** Homepage featured pages — Pages flagged "Feature on homepage". */
export async function getFeaturedPages(): Promise<NavLink[]> {
  try {
    const locale = await getCurrentLocale();
    return await fetchFeaturedPages(locale);
  } catch {
    return [];
  }
}

export type SiteContact = {
  phone: string;
  phoneHref: string;
  email: string;
  address: string | null;
};

/** Contact details from Site settings, falling back to the built-in defaults. */
export async function getSiteContact(): Promise<SiteContact> {
  const { SITE_EMAIL, SITE_PHONE_DISPLAY, SITE_PHONE_HREF } = await import(
    "@/lib/site-contact"
  );
  const fallback: SiteContact = {
    phone: SITE_PHONE_DISPLAY,
    phoneHref: SITE_PHONE_HREF,
    email: SITE_EMAIL,
    address: null,
  };

  try {
    const site = await getCachedSiteGlobal();

    const phone = (site.contactPhone as string)?.trim() || fallback.phone;
    const email = (site.contactEmail as string)?.trim() || fallback.email;
    const address = (site.contactAddress as string)?.trim() || null;
    // Derive the tel: target from the displayed phone (keep digits and +).
    const phoneHref = phone.replace(/[^\d+]/g, "") || fallback.phoneHref;

    return { phone, phoneHref, email, address };
  } catch {
    return fallback;
  }
}

export type SocialLinks = { instagram: string | null; tiktok: string | null };

/** Social profile URLs from Site settings — null when unset. Not localized. */
export async function getSocialLinks(): Promise<SocialLinks> {
  try {
    const site = await getCachedSiteGlobal();
    return {
      instagram: (site.instagramUrl as string)?.trim() || null,
      tiktok: (site.tiktokUrl as string)?.trim() || null,
    };
  } catch {
    return { instagram: null, tiktok: null };
  }
}

export type PartnerCard = { id: string; name: string; description: string | null; logoUrl: string | null; website: string | null };

function mediaUrlOf(media: unknown): string | null {
  if (media && typeof media === "object" && "url" in media) {
    return (media as { url?: string }).url ?? null;
  }
  return null;
}

const fetchFeaturedPartners = unstable_cache(
  async (locale: Locale): Promise<PartnerCard[]> => {
    const payload = await getPayloadClient();
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
      description:
        pickLocalized<string>(
          p as unknown as Record<string, unknown>,
          "description",
          locale,
        )?.trim() || null,
      logoUrl: mediaUrlOf(p.logo),
      website: ((p.website as string)?.trim() || null),
    }));
  },
  ["featured-partners"],
  { revalidate: 300, tags: ["partners"] },
);

/** Homepage/festival featured partners — partners flagged "Show on festival landing". */
export async function getFeaturedPartners(): Promise<PartnerCard[]> {
  try {
    const locale = await getCurrentLocale();
    return await fetchFeaturedPartners(locale);
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

const fetchFeaturedNews = unstable_cache(
  async (locale: Locale, limit: number): Promise<NewsCard[]> => {
    const payload = await getPayloadClient();
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
    return res.docs.map((p) => {
      const doc = p as unknown as Record<string, unknown>;
      return {
        id: p.id as string,
        title: pickField<string>(doc, "title", locale) || "",
        slug: (p.slug as string) || "",
        excerpt: pickField<string>(doc, "excerpt", locale)?.trim() || null,
        coverUrl: mediaUrlOf(p.coverImage),
        publishedAt: (p.publishedAt as string) || null,
      };
    });
  },
  ["featured-news"],
  { revalidate: 300, tags: ["posts"] },
);

/** Admin-selected news for the festival landing — posts flagged "Feature on homepage". */
export async function getFeaturedNews(limit = 6): Promise<NewsCard[]> {
  try {
    const locale = await getCurrentLocale();
    return await fetchFeaturedNews(locale, limit);
  } catch {
    return [];
  }
}
