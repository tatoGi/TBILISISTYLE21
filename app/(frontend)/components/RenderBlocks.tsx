import Image from "next/image";
import Link from "next/link";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { CONTENT_FALLBACK_LOCALE, pickField } from "@/lib/i18n-content";

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

function mediaAlt(media: MediaLike, locale: string): string {
  if (media && typeof media === "object") {
    const picked = pickField<string>(media as Record<string, unknown>, "alt", locale);
    if (picked) return picked;
    // Back-compat for any media that still carries the old single `alt` field.
    if (media.alt) return media.alt;
  }
  return "";
}

// Loose block shape — the Payload blocks field is a discriminated union; we
// switch on blockType and read the relevant fields.
type Block = Record<string, unknown> & { blockType?: string; id?: string };

export function RenderBlocks({
  blocks,
  locale = CONTENT_FALLBACK_LOCALE,
}: {
  blocks?: Block[] | null;
  locale?: string;
}) {
  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block, i) => {
        const key = (block.id as string) || `${block.blockType}-${i}`;
        switch (block.blockType) {
          case "hero":
            return <Hero key={key} block={block} locale={locale} />;
          case "richText":
            return <TextBlock key={key} block={block} locale={locale} />;
          case "image":
            return <ImageBlock key={key} block={block} locale={locale} />;
          case "gallery":
            return <Gallery key={key} block={block} locale={locale} />;
          case "cta":
            return <CTA key={key} block={block} locale={locale} />;
          default:
            return null;
        }
      })}
    </>
  );
}

function Hero({ block, locale }: { block: Block; locale: string }) {
  const url = mediaUrl(block.image as MediaLike);
  return (
    <section className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden">
      {url ? (
        <Image
          src={url}
          alt={mediaAlt(block.image as MediaLike, locale)}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : null}
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
        <h1 className="text-4xl font-extrabold uppercase tracking-wider md:text-6xl">
          {pickField<string>(block, "heading", locale)}
        </h1>
        {pickField<string>(block, "subheading", locale) ? (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80">
            {pickField<string>(block, "subheading", locale)}
          </p>
        ) : null}
        {pickField<string>(block, "ctaLabel", locale) && block.ctaHref ? (
          <Link
            href={block.ctaHref as string}
            className="mt-8 inline-block bg-yellow-300 px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-black transition hover:bg-white"
          >
            {pickField<string>(block, "ctaLabel", locale)}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function TextBlock({ block, locale }: { block: Block; locale: string }) {
  const content = pickField<SerializedEditorState>(block, "content", locale);
  if (!content) return null;
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="prose prose-invert max-w-none uppercase leading-relaxed text-white/80">
        <RichText data={content} />
      </div>
    </section>
  );
}

function ImageBlock({ block, locale }: { block: Block; locale: string }) {
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
          alt={mediaAlt(block.image as MediaLike, locale)}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      {pickField<string>(block, "caption", locale) ? (
        <p className="mt-2 text-center text-sm text-white/50">
          {pickField<string>(block, "caption", locale)}
        </p>
      ) : null}
    </section>
  );
}

function Gallery({ block, locale }: { block: Block; locale: string }) {
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
                alt={mediaAlt(item.image as MediaLike, locale)}
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

function CTA({ block, locale }: { block: Block; locale: string }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-10 text-center">
      <Link
        href={block.href as string}
        className="inline-block bg-yellow-300 px-8 py-4 text-sm font-extrabold uppercase tracking-wider text-black transition hover:bg-white"
      >
        {pickField<string>(block, "label", locale)}
      </Link>
    </section>
  );
}
