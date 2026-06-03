import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentLocale, getPayloadClient } from "@/lib/payload";
import { RenderBlocks } from "../components/RenderBlocks";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function findPage(slug: string) {
  const payload = await getPayloadClient();
  const locale = await getCurrentLocale();
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    locale,
    fallbackLocale: "ka",
    depth: 2,
    limit: 1,
  });
  return result.docs[0] ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await findPage(slug);
  if (!page) return {};
  const seo = page as unknown as Record<string, unknown>;
  return {
    title: (seo.metaTitle as string) || (page.title as string),
    description: (seo.metaDescription as string) || undefined,
  };
}

export default async function CmsPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await findPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black pt-24 pb-16 text-white">
      <RenderBlocks blocks={page.layout as never} />
    </main>
  );
}
