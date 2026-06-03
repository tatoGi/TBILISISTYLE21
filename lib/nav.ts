import { getCurrentLocale, getPayloadClient } from "@/lib/payload";

export type NavLink = { label: string; href: string };

type PageRef = { slug?: string; title?: string; navLabel?: string };

function toLink(page: PageRef, override?: string): NavLink {
  return {
    label: (override || page.navLabel || page.title || page.slug || "").toString(),
    href: `/${page.slug}`,
  };
}

/**
 * Site menu — driven by the drag-sortable "Menu" global. Falls back to Pages
 * flagged "Show in site menu" (ordered by navOrder) if the menu is empty.
 */
export async function getNavPages(): Promise<NavLink[]> {
  try {
    const payload = await getPayloadClient();
    const locale = await getCurrentLocale();

    const site = await payload.findGlobal({ slug: "site", locale, fallbackLocale: "ka", depth: 1 });
    const menu = (site?.menu ?? []) as { page?: unknown; label?: string }[];
    const fromGlobal = menu
      .filter((i) => i.page && typeof i.page === "object")
      .map((i) => toLink(i.page as PageRef, i.label));
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
    return res.docs.map((p) => toLink(p as PageRef));
  } catch {
    return [];
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
      limit: 100,
    });
    return res.docs.map((p) => toLink(p as PageRef));
  } catch {
    return [];
  }
}
