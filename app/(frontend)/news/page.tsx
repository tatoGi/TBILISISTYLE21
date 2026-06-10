import Image from "next/image";
import Link from "next/link";
import { getCurrentLocale, getPayloadClient } from "@/lib/payload";
import { pickField } from "@/lib/i18n-content";

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
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-5 pb-16 pt-28 text-white md:px-10 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(253,224,71,0.035)_0%,transparent_75%)]" />

      <div className="relative z-10 grid gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
          Tbilisi Style 21
        </p>
        <h1 className="font-heading text-4xl font-extrabold uppercase tracking-wide md:text-6xl">
          News
        </h1>
      </div>

      <div className="relative z-10 mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.length ? (
          posts.map((post) => {
            const url = mediaUrl(post.coverImage);
            const doc = post as unknown as Record<string, unknown>;
            const title = pickField<string>(doc, "title", locale) || "";
            const excerpt = pickField<string>(doc, "excerpt", locale)?.trim() || "";
            return (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] transition-all duration-500 hover:-translate-y-1.5 hover:border-yellow-300/30 hover:bg-white/[0.03] hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-white/[0.02]">
                  {url ? (
                    <>
                      <Image
                        src={url}
                        alt={title}
                        fill
                        className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-30" />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center border-b border-white/5 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/20">
                      Tbilisi Style 21
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {post.publishedAt ? (
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-300 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                        {formatDate(post.publishedAt as string)}
                      </span>
                    </div>
                  ) : null}
                  <h2 className="font-heading text-lg font-extrabold uppercase leading-snug tracking-wide text-white transition-colors duration-300 group-hover:text-yellow-300">
                    {title}
                  </h2>
                  {excerpt ? (
                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-white/50">
                      {excerpt}
                    </p>
                  ) : null}
                  <div className="mt-auto pt-5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-300/0 opacity-0 transition-all duration-500 transform translate-y-1 group-hover:text-yellow-300 group-hover:opacity-100 group-hover:translate-y-0">
                    <span>Read Article</span>
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="col-span-full rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-white/40 backdrop-blur-md">
            No news yet.
          </p>
        )}
      </div>
    </main>
  );
}
