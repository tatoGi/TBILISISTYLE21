import Image from "next/image";
import Link from "next/link";
import AboutImg from "@/public/images/secondImg_1920x1080.jpeg";
import { getTranslations } from "next-intl/server";
import { getFeaturedPages, getFeaturedPartners, getFeaturedNews } from "@/lib/nav";
import { listProducts } from "@/lib/products";
import ProductReel from "../../components/ProductReel";
import PartnersStrip from "../../components/PartnersStrip";
import NewsTeaser from "../../components/NewsTeaser";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const t = await getTranslations("nav");
  const tHome = await getTranslations("home");
  const [featured, products, partners, featuredNews] = await Promise.all([
    getFeaturedPages(),
    listProducts({ publicOnly: true }),
    getFeaturedPartners(),
    getFeaturedNews(6),
  ]);

  // Split into two balanced columns (left / right), matching the original layout.
  const mid = Math.ceil(featured.length / 2);
  const left = featured.slice(0, mid);
  const right = featured.slice(mid);

  // "Belly"/oval spread: each item bows outward, strongest in the middle of the
  // column, so the two columns together trace an ellipse. Returned in `vw` so it
  // scales with the viewport; only applied on md+ (mobile stays a clean stack).
  const bellyVw = (index: number, count: number) => {
    if (count <= 1) return 4;
    const factor = Math.sin(((index + 0.5) / count) * Math.PI); // 0 → 1 → 0
    return +(2 + factor * 7).toFixed(2); // base spread + belly
  };

  return (
    <main className="relative w-full">
      <section className="relative w-full min-h-[68vh] overflow-hidden">
        <Image
          src={AboutImg}
          alt="Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 flex min-h-[68vh] items-center justify-center px-6 pt-24 pb-10">
          {featured.length ? (
          <div className="grid w-full max-w-7xl grid-cols-1 gap-10 text-white uppercase md:grid-cols-2 md:gap-24">
            <div className="flex flex-col items-center gap-9 md:items-start">
              {left.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ ["--belly" as string]: `${bellyVw(i, left.length)}vw` }}
                  className="md:[transform:translateX(calc(var(--belly)*-1))]"
                >
                  <p className="text-base font-medium tracking-[0.28em] text-white/85 transition-all duration-300 hover:tracking-[0.36em] hover:text-yellow-300 sm:text-lg md:text-xl">
                    {item.label}
                  </p>
                </Link>
              ))}
            </div>

            <div className="flex flex-col items-center gap-9 md:items-end md:text-right">
              {right.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ ["--belly" as string]: `${bellyVw(i, right.length)}vw` }}
                  className="md:[transform:translateX(var(--belly))]"
                >
                  <p className="text-base font-medium tracking-[0.28em] text-white/85 transition-all duration-300 hover:tracking-[0.36em] hover:text-yellow-300 sm:text-lg md:text-xl">
                    {item.label}
                  </p>
                </Link>
              ))}
            </div>
          </div>
          ) : (
            <p className="relative z-10 text-center text-sm uppercase tracking-[0.2em] text-white/60">
              Mark pages with “Feature on homepage” in the admin to show them here.
            </p>
          )}
        </div>
      </section>

      <NewsTeaser posts={featuredNews} heading={t("news")} viewAllLabel={tHome("allNews")} />

      <PartnersStrip partners={partners} heading={t("partners")} />

      <ProductReel products={products} />
    </main>
  );
}
