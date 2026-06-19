import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { getCurrentLocale, getPayloadClient } from "@/lib/payload";
import { pickField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/config";
import { RenderBlocks } from "../components/RenderBlocks";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Cache the page lookup per (slug, locale). Called by both generateMetadata and
// the component; revalidate 5 min / revalidateTag "pages". Keeps CMS page reads
// off Postgres on every request.
const fetchPageBySlug = unstable_cache(
  async (slug: string, locale: Locale) => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      locale,
      fallbackLocale: "ka",
      depth: 2,
      limit: 1,
    });
    return result.docs[0] ?? null;
  },
  ["page-by-slug"],
  { revalidate: 300, tags: ["pages"] },
);

async function findPage(slug: string) {
  const locale = await getCurrentLocale();
  const page = await fetchPageBySlug(slug, locale);
  return { page, locale };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { page, locale } = await findPage(slug);
  if (!page) return {};
  const doc = page as unknown as Record<string, unknown>;
  return {
    title:
      pickField<string>(doc, "metaTitle", locale) ||
      pickField<string>(doc, "title", locale),
    description: pickField<string>(doc, "metaDescription", locale) || undefined,
  };
}

export default async function CmsPage({ params }: PageProps) {
  const { slug } = await params;
  const { page, locale } = await findPage(slug);

  if (!page) {
    notFound();
  }

  const doc = page as unknown as Record<string, unknown>;
  const pageTitle = pickField<string>(doc, "title", locale) || "";

  return (
    <main className="min-h-screen bg-black text-white">
      {pageTitle ? (
        <header className="border-b border-white/10 bg-gradient-to-b from-[#0c0c0c] to-black px-6 pb-10 pt-28 text-center sm:pt-32">
          <p className="font-heading mb-2 text-[10px] font-bold uppercase tracking-[0.32em] text-yellow-300/80">
            Tbilisi Style 21
          </p>
          <h1 className="font-heading text-[clamp(1.5rem,4.5vw,2.75rem)] font-extrabold uppercase tracking-[0.05em]">
            {pageTitle}
          </h1>
          <span className="mx-auto mt-5 block h-[3px] w-16 rounded-full bg-yellow-300" />
        </header>
      ) : null}
      <div className="pb-16 pt-4">
        <RenderBlocks blocks={page.layout as never} locale={locale} />
      </div>
    </main>
  );
}
