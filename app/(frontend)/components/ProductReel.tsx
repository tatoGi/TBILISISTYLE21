"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Product } from "@/lib/products";

function inStock(product: Product) {
  return product.sizes.reduce((sum, s) => sum + Math.max(0, s.quantity), 0);
}

function ProductCard({ product }: { product: Product }) {
  const soldOut = product.status === "sold_out" || inStock(product) <= 0;

  return (
    <Link
      href="/dashboard/shop"
      className="group relative mx-2 flex w-[200px] shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] sm:w-[240px]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-white/[0.04]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase tracking-widest text-white/30">
            Tbilisi Style 21
          </div>
        )}
        {product.isVip ? (
          <span className="absolute left-2.5 top-2.5 bg-yellow-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
            VIP
          </span>
        ) : null}
        {soldOut ? (
          <span className="absolute right-2.5 top-2.5 bg-black/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
            Sold out
          </span>
        ) : null}
        <span className="absolute bottom-2.5 right-2.5 rounded-full bg-yellow-300 px-3 py-1 text-sm font-black text-black">
          {product.priceGel} ₾
        </span>
      </div>
      <div className="flex flex-col gap-1 p-3.5">
        {product.category ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            {product.category}
          </p>
        ) : null}
        <h3 className="truncate text-sm font-black uppercase leading-tight text-white">
          {product.title}
        </h3>
      </div>
    </Link>
  );
}

/**
 * Auto-rotating, infinitely-looping product reel. We render the products twice
 * back-to-back and translate the track by -50%, so the loop is seamless. Hover
 * pauses it (handled in CSS), and clicking any card goes to the shop.
 */
export default function ProductReel({ products }: { products: Product[] }) {
  const t = useTranslations();

  if (!products.length) return null;

  // Duplicate so the marquee can loop without a visible seam.
  const loop = [...products, ...products];

  return (
    <section className="relative z-10 w-full bg-black pt-6 pb-12 sm:pt-8 sm:pb-16">
      <div className="mx-auto mb-8 flex max-w-7xl flex-col items-center gap-3 px-6 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
            Tbilisi Style 21
          </p>
          <h2 className="text-3xl font-black uppercase text-white md:text-5xl">
            {t("nav.shop")}
          </h2>
        </div>
        <Link
          href="/dashboard/shop"
          className="rounded-full border border-white/25 px-5 py-2 text-xs font-extrabold uppercase tracking-wide text-white transition-all duration-200 hover:border-yellow-300 hover:text-yellow-300"
        >
          {t("nav.shop")} →
        </Link>
      </div>

      <div className="ts-marquee relative w-full overflow-hidden">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black to-transparent" />

        <div className="ts-marquee-track py-2">
          {loop.map((product, i) => (
            <ProductCard key={`${product.id}-${i}`} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
