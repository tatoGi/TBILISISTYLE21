import Image from "next/image";
import MainImg from "@/public/images/dashboardimage_1920x1080_full.jpeg";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <main className="relative w-full h-screen overflow-hidden">
      
      <Image
        src={MainImg}
        alt="Background"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_35%]"
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute top-0 left-0 right-0 z-10 pt-8 md:pt-12 lg:pt-16 text-center">
        <h1 className="font-heading text-[8vw] md:text-[3vw] lg:text-[2rem] font-extrabold uppercase tracking-tight whitespace-nowrap text-white">
          {t("title")}
        </h1>
        <p className="font-heading text-[3.5vw] md:text-[2vw] lg:text-[1.5rem] font-bold uppercase tracking-wide whitespace-nowrap text-white mt-1 md:mt-2">
          {t("subtitle")}
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
        <Link
          href="/dashboard/festival"
          className="ts-ticket-pulse group inline-flex items-center gap-3 rounded-full bg-yellow-300 px-8 py-4 font-heading text-base md:text-lg lg:text-xl font-extrabold uppercase tracking-wide whitespace-nowrap text-black transition-all duration-300 hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300/60 sm:px-10 sm:py-5"
        >
          <span>{t("enter")}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </Link>
      </div>

    </main>
  );
}
