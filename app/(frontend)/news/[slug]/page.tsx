import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCurrentLocale, getPayloadClient } from "@/lib/payload";
import { RenderBlocks } from "../../components/RenderBlocks";

export const dynamic = "force-dynamic";

type PostProps = {
  params: Promise<{ slug: string }>;
};

function mediaUrl(media: unknown): string | null {
  if (media && typeof media === "object" && "url" in media) {
    return (media as { url?: string }).url ?? null;
  }
  return null;
}

async function findPost(slug: string) {
  const payload = await getPayloadClient();
  const locale = await getCurrentLocale();
  const result = await payload.find({
    collection: "posts",
    where: {
      slug: { equals: slug },
      _status: { equals: "published" },
    },
    locale,
    fallbackLocale: "ka",
    depth: 2,
    limit: 1,
  });
  return result.docs[0] ?? null;
}

export async function generateMetadata({ params }: PostProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) return {};
  return {
    title: post.title as string,
    description: (post.excerpt as string) || undefined,
  };
}

export default async function NewsPostPage({ params }: PostProps) {
  const { slug } = await params;
  const post = await findPost(slug);

  if (!post) {
    notFound();
  }

  const url = mediaUrl(post.coverImage);

  return (
    <main className="min-h-screen bg-black pb-16 pt-24 text-white">
      <article className="mx-auto w-full max-w-3xl px-6">
        <h1 className="text-3xl font-black uppercase leading-tight md:text-5xl">
          {post.title as string}
        </h1>
      </article>

      {url ? (
        <div className="mx-auto mt-8 w-full max-w-5xl px-6">
          <div className="relative h-[300px] w-full overflow-hidden rounded-xl sm:h-[460px]">
            <Image
              src={url}
              alt={(post.title as string) || ""}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <RenderBlocks blocks={post.layout as never} />
      </div>
    </main>
  );
}
