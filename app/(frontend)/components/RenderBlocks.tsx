import Image from "next/image";
import Link from "next/link";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

type MediaLike =
  | {
      url?: string | null;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
    }
  | string
  | number
  | null
  | undefined;

function mediaUrl(media: MediaLike): string | null {
  if (media && typeof media === "object" && media.url) return media.url;
  return null;
}

function mediaAlt(media: MediaLike): string {
  if (media && typeof media === "object" && media.alt) return media.alt;
  return "";
}

// Loose block shape — the Payload blocks field is a discriminated union; we
// switch on blockType and read the relevant fields.
type Block = Record<string, unknown> & { blockType?: string; id?: string };

export function RenderBlocks({ blocks }: { blocks?: Block[] | null }) {
  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block, i) => {
        const key = (block.id as string) || `${block.blockType}-${i}`;
        switch (block.blockType) {
          case "hero":
            return <Hero key={key} block={block} />;
          case "richText":
            return <TextBlock key={key} block={block} />;
          case "image":
            return <ImageBlock key={key} block={block} />;
          case "gallery":
            return <Gallery key={key} block={block} />;
          case "cta":
            return <CTA key={key} block={block} />;
          default:
            return null;
        }
      })}
    </>
  );
}

function Hero({ block }: { block: Block }) {
  const url = mediaUrl(block.image as MediaLike);
  return (
    <section className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden">
      {url ? (
        <Image
          src={url}
          alt={mediaAlt(block.image as MediaLike)}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : null}
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
        <h1 className="text-4xl font-extrabold uppercase tracking-wider md:text-6xl">
          {block.heading as string}
        </h1>
        {block.subheading ? (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80">
            {block.subheading as string}
          </p>
        ) : null}
        {block.ctaLabel && block.ctaHref ? (
          <Link
            href={block.ctaHref as string}
            className="mt-8 inline-block bg-yellow-300 px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-black transition hover:bg-white"
          >
            {block.ctaLabel as string}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function TextBlock({ block }: { block: Block }) {
  const content = block.content as SerializedEditorState | undefined;
  if (!content) return null;
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="prose prose-invert max-w-none uppercase leading-relaxed text-white/80">
        <RichText data={content} />
      </div>
    </section>
  );
}

function ImageBlock({ block }: { block: Block }) {
  const url = mediaUrl(block.image as MediaLike);
  if (!url) return null;
  const contained = block.width === "contained";
  return (
    <section
      className={`mx-auto w-full px-6 py-8 ${contained ? "max-w-3xl" : "max-w-6xl"}`}
    >
      <div className="relative h-[300px] w-full overflow-hidden rounded-xl sm:h-[460px] md:h-[560px]">
        <Image
          src={url}
          alt={mediaAlt(block.image as MediaLike)}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      {block.caption ? (
        <p className="mt-2 text-center text-sm text-white/50">
          {block.caption as string}
        </p>
      ) : null}
    </section>
  );
}

function Gallery({ block }: { block: Block }) {
  const images = (block.images as Array<Record<string, unknown>>) || [];
  if (!images.length) return null;
  const cols = (block.columns as string) || "3";
  const colClass =
    cols === "2"
      ? "sm:grid-cols-2"
      : cols === "4"
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className={`grid gap-4 ${colClass}`}>
        {images.map((item, i) => {
          const url = mediaUrl(item.image as MediaLike);
          if (!url) return null;
          return (
            <div
              key={i}
              className="relative h-[360px] w-full overflow-hidden rounded-xl"
            >
              <Image
                src={url}
                alt={mediaAlt(item.image as MediaLike)}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CTA({ block }: { block: Block }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-10 text-center">
      <Link
        href={block.href as string}
        className="inline-block bg-yellow-300 px-8 py-4 text-sm font-extrabold uppercase tracking-wider text-black transition hover:bg-white"
      >
        {block.label as string}
      </Link>
    </section>
  );
}
