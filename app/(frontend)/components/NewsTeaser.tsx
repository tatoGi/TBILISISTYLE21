import Image from "next/image";
import Link from "next/link";
import type { NewsCard } from "@/lib/nav";

type Props = {
  posts: NewsCard[];
  heading: string;
  viewAllLabel: string;
};

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

/**
 * "Latest news" teaser for the festival landing: the most recent posts with a
 * link through to the full /news list. Renders nothing when there are no posts.
 */
export default function NewsTeaser({ posts, heading, viewAllLabel }: Props) {
  if (!posts.length) return null;

  return (
    <section className="w-full bg-black px-6 py-16 text-white md:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/news"
          className="inline-block text-3xl font-extrabold uppercase tracking-tight transition hover:text-yellow-300 md:text-5xl"
        >
          {heading}
        </Link>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/news/${post.slug}`}
              className="group flex flex-col overflow-hidden border border-white/10 bg-white/[0.03] transition hover:border-white/30"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/[0.04]">
                {post.coverUrl ? (
                  <Image
                    src={post.coverUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                {post.publishedAt ? (
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                    {formatDate(post.publishedAt)}
                  </p>
                ) : null}
                <h3 className="text-lg font-extrabold uppercase leading-tight">
                  {post.title}
                </h3>
                {post.excerpt ? (
                  <p className="line-clamp-3 text-sm leading-6 text-white/65">
                    {post.excerpt}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:border-yellow-300 hover:text-yellow-300"
          >
            {viewAllLabel}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
