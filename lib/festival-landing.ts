import { getTranslations } from "next-intl/server";
import { pickField } from "@/lib/i18n-content";
import { getCurrentLocale, getPayloadClient } from "@/lib/payload";

export type FestivalHeroContent = {
  badge: string;
  title: string;
  tagline: string;
};

/** Hero copy for /dashboard/festival — CMS (Site settings) with i18n fallbacks. */
export async function getFestivalHeroContent(): Promise<FestivalHeroContent> {
  const locale = await getCurrentLocale();
  const tHome = await getTranslations("home");
  const tLanding = await getTranslations("festivalLanding");

  const fallbacks: FestivalHeroContent = {
    badge: tHome("subtitle"),
    title: tHome("title"),
    tagline: tLanding("heroTagline"),
  };

  try {
    const payload = await getPayloadClient();
    const site = (await payload.findGlobal({
      slug: "site",
      depth: 0,
    })) as unknown as Record<string, unknown>;

    return {
      badge: pickField<string>(site, "heroBadge", locale) ?? fallbacks.badge,
      title: pickField<string>(site, "heroTitle", locale) ?? fallbacks.title,
      tagline: pickField<string>(site, "heroTagline", locale) ?? fallbacks.tagline,
    };
  } catch {
    return fallbacks;
  }
}
