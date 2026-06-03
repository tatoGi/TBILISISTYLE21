import Image from "next/image";
import Link from "next/link";
import AboutImg from "@/public/images/secondImg_1920x1080.jpeg";
import { getFeaturedPages } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const featured = await getFeaturedPages();

  // Split into two balanced columns (left / right), matching the original layout.
  const mid = Math.ceil(featured.length / 2);
  const left = featured.slice(0, mid);
  const right = featured.slice(mid);

  return (
    <main className="relative w-full min-h-screen overflow-hidden">
      <Image
        src={AboutImg}
        alt="Background"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        {featured.length ? (
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 text-white uppercase">
            <div className="flex flex-col gap-10">
              {left.map((item) => (
                <Link key={item.href} href={item.href}>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold cursor-pointer transition-all duration-200 hover:text-yellow-300 hover:scale-[1.03]">
                    {item.label}
                  </p>
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-10 md:items-end md:text-right">
              {right.map((item) => (
                <Link key={item.href} href={item.href}>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold cursor-pointer transition-all duration-200 hover:text-yellow-300 hover:scale-[1.03]">
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
    </main>
  );
}
