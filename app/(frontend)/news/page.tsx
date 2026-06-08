import Image from "next/image";
import Link from "next/link";
import { getCurrentLocale, getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

function mediaUrl(media: unknown): string | null {
  if (media && typeof media === "object" && "url" in media) {
    return (media as { url?: string }).url ?? null;
  }
  return null;
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function NewsPage() {
  const payload = await getPayloadClient();
  const locale = await getCurrentLocale();

  const result = await payload.find({
    collection: "posts",
    locale,
    fallbackLocale: "ka",
    depth: 1,
    sort: "-publishedAt",
    limit: 50,
    where: { _status: { equals: "published" } },
  });

  const posts = result.docs;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 pb-16 pt-28 text-white md:px-10">
      <div className="grid gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
          Tbilisi Style 21
        </p>
        <h1 className="text-4xl font-extrabold uppercase md:text-6xl">News</h1>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.length ? (
          posts.map((post) => {
            const url = mediaUrl(post.coverImage);
            return (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group flex flex-col overflow-hidden border border-white/10 bg-white/[0.03] transition hover:border-white/30"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/[0.04]">
                  {url ? (
                    <Image
                      src={url}
                      alt={(post.title as string) || ""}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  {post.publishedAt ? (
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                      {formatDate(post.publishedAt as string)}
                    </p>
                  ) : null}
                  <h2 className="text-lg font-extrabold uppercase leading-tight">
                    {post.title as string}
                  </h2>
                  {post.excerpt ? (
                    <p className="line-clamp-3 text-sm leading-6 text-white/65">
                      {post.excerpt as string}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })
        ) : (
          <p className="border border-white/10 p-5 text-white/60">
            No news yet.
          </p>
        )}
      </div>
    </main>
  );
}
