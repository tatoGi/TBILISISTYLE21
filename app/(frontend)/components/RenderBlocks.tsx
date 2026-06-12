import type { ReactNode } from "react";
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

function mediaDims(media: MediaLike): { width: number; height: number } | null {
  if (media && typeof media === "object" && media.width && media.height) {
    return { width: media.width, height: media.height };
  }
  return null;
}

/**
 * Renders the whole image at its natural aspect ratio (never cropped). Uses the
 * media's intrinsic width/height when known; otherwise falls back to a
 * `contain`-fitted box so nothing is cut off.
 */
function BlockImage({
  media,
  locale,
  className = "",
  sizes,
}: {
  media: MediaLike;
  locale: string;
  className?: string;
  sizes?: string;
}) {
  const url = mediaUrl(media);
  if (!url) return null;
  const dims = mediaDims(media);
  const alt = mediaAlt(media, locale);

  if (dims) {
    return (
      <Image
        src={url}
        alt={alt}
        width={dims.width}
        height={dims.height}
        className={`h-auto w-full ${className}`}
        sizes={sizes}
      />
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full">
      <Image src={url} alt={alt} fill className={`object-contain ${className}`} sizes={sizes} />
    </div>
  );
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

  const out: ReactNode[] = [];
  // `bandIndex` counts only the content sections (not the hero) so we can
  // alternate a subtle background tint and give the page a vertical rhythm.
  let bandIndex = 0;
  let splitIndex = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const next = blocks[i + 1];
    const key = (block.id as string) || `${block.blockType}-${i}`;

    // Pair an adjacent image + text into a single side-by-side section,
    // alternating the image side so the page reads as an editorial layout
    // instead of a full-width image stacked on top of the text.
    if (next && isImageTextPair(block, next)) {
      const image = block.blockType === "image" ? block : next;
      const text = block.blockType === "richText" ? block : next;
      out.push(
        <SplitSection
          key={key}
          image={image}
          text={text}
          locale={locale}
          reverse={splitIndex % 2 === 1}
          tint={bandIndex % 2 === 1}
        />,
      );
      splitIndex += 1;
      bandIndex += 1;
      i += 1; // consume the paired block
      continue;
    }

    const tint = bandIndex % 2 === 1;
    switch (block.blockType) {
      case "hero":
        out.push(<Hero key={key} block={block} locale={locale} />);
        break; // hero is full-bleed; it is not a tinted band
      case "richText":
        out.push(<TextBlock key={key} block={block} locale={locale} tint={tint} />);
        bandIndex += 1;
        break;
      case "image":
        out.push(<ImageBlock key={key} block={block} locale={locale} tint={tint} />);
        bandIndex += 1;
        break;
      case "gallery":
        out.push(<Gallery key={key} block={block} locale={locale} tint={tint} />);
        bandIndex += 1;
        break;
      case "cta":
        out.push(<CTA key={key} block={block} locale={locale} tint={tint} />);
        bandIndex += 1;
        break;
      default:
        break;
    }
  }

  return <>{out}</>;
}

function isImageTextPair(a: Block, b: Block): boolean {
  const types = [a.blockType, b.blockType];
  return types.includes("image") && types.includes("richText");
}

/**
 * Full-bleed content section with a subtle alternating tint and a scroll-reveal
 * (fade-up) entrance. `inner` controls the centered reading column width.
 */
function Band({
  tint,
  inner = "max-w-6xl",
  className = "",
  children,
}: {
  tint?: boolean;
  inner?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`ts-reveal w-full px-6 py-12 md:py-16 ${tint ? "bg-white/[0.025]" : ""}`}
    >
      <div className={`mx-auto w-full ${inner} ${className}`}>{children}</div>
    </section>
  );
}

/** Image and text side by side; `reverse` flips the image to the right. */
function SplitSection({
  image,
  text,
  locale,
  reverse,
  tint,
}: {
  image: Block;
  text: Block;
  locale: string;
  reverse: boolean;
  tint?: boolean;
}) {
  const content = pickField<SerializedEditorState>(text, "content", locale);
  const caption = pickField<string>(image, "caption", locale);

  return (
    <Band tint={tint}>
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
        <figure className={`m-0 ${reverse ? "md:order-2" : "md:order-1"}`}>
          <BlockImage
            media={image.image as MediaLike}
            locale={locale}
            className="rounded-2xl"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {caption ? (
            <figcaption className="mt-2 text-center text-sm text-white/50">
              {caption}
            </figcaption>
          ) : null}
        </figure>

        <div className={`ts-content-prose ${reverse ? "md:order-1" : "md:order-2"}`}>
          {content ? <RichText data={content} /> : null}
        </div>
      </div>
    </Band>
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

function TextBlock({ block, locale, tint }: { block: Block; locale: string; tint?: boolean }) {
  const content = pickField<SerializedEditorState>(block, "content", locale);
  if (!content) return null;
  return (
    <Band tint={tint} inner="max-w-3xl">
      <div className="ts-content-prose">
        <RichText data={content} />
      </div>
    </Band>
  );
}

function ImageBlock({ block, locale, tint }: { block: Block; locale: string; tint?: boolean }) {
  const url = mediaUrl(block.image as MediaLike);
  if (!url) return null;
  const contained = block.width === "contained";
  return (
    <Band tint={tint} inner={contained ? "max-w-3xl" : "max-w-6xl"}>
      <BlockImage
        media={block.image as MediaLike}
        locale={locale}
        className="rounded-xl"
        sizes="100vw"
      />
      {pickField<string>(block, "caption", locale) ? (
        <p className="mt-2 text-center text-sm text-white/50">
          {pickField<string>(block, "caption", locale)}
        </p>
      ) : null}
    </Band>
  );
}

function Gallery({ block, locale, tint }: { block: Block; locale: string; tint?: boolean }) {
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
    <Band tint={tint}>
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
    </Band>
  );
}

function CTA({ block, locale, tint }: { block: Block; locale: string; tint?: boolean }) {
  return (
    <Band tint={tint} inner="max-w-3xl" className="text-center">
      <Link
        href={block.href as string}
        className="inline-block bg-yellow-300 px-8 py-4 text-sm font-extrabold uppercase tracking-wider text-black transition hover:bg-white"
      >
        {pickField<string>(block, "label", locale)}
      </Link>
    </Band>
  );
}
