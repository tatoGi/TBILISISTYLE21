"use client";

import Image from "next/image";
import UkrainianImg from "@/public/images/ukrainianday.jpeg";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { navItems } from "@/app/components/navItems";

export default function UkrainianDayPage() {
  const [navOpen, setNavOpen] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "auto";
  }, [navOpen]);

  return (
    <main className="relative w-full min-h-screen bg-black text-white overflow-hidden">
      <div
        className="fixed inset-0 z-40 bg-black transition-opacity duration-300"
        style={{
          opacity: navOpen ? 0.6 : 0,
          pointerEvents: navOpen ? "auto" : "none",
        }}
        onClick={() => setNavOpen(false)}
      />

      <div
        className="fixed top-0 right-0 z-50 h-full flex flex-col transition-transform duration-300"
        style={{
          transform: navOpen ? "translateX(0)" : "translateX(100%)",
          width: "min(100vw, 360px)",
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex flex-col h-full overflow-y-auto px-8 pt-28 pb-8 relative">
          <button
            onClick={() => setNavOpen(false)}
            className="absolute top-6 right-6 w-8 h-8"
          >
            <span className="block w-6 h-[2px] bg-white rotate-45 absolute" />
            <span className="block w-6 h-[2px] bg-white -rotate-45 absolute" />
          </button>

          <nav className="flex flex-col flex-1 justify-center gap-0">
            {navItems.map((item, i) => (
              <a
                key={item.labelKey}
                href="#"
                onClick={() => setNavOpen(false)}
                style={{
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: "0.1em",
                  fontSize: "clamp(0.75rem, 2.2vh, 1.05rem)",
                  paddingTop: "clamp(5px, 1.2vh, 10px)",
                  paddingBottom: "clamp(5px, 1.2vh, 10px)",
                  borderBottom:
                    i < navItems.length - 1
                      ? "1px solid rgba(255,255,255,0.07)"
                      : "none",
                }}
                className="block uppercase font-bold text-white hover:text-yellow-300 hover:pl-2 transition-all duration-200"
              >
                {t(`nav.${item.labelKey}`)}
              </a>
            ))}
          </nav>

          <div className="w-full h-[1px] bg-white/20 mt-4 mb-4" />

          <p
            style={{
              fontFamily: "'Courier New', monospace",
              letterSpacing: "0.08em",
              lineHeight: "1.8",
              fontSize: "clamp(0.6rem, 1.4vh, 0.8rem)",
            }}
            className="text-white/50 uppercase font-semibold"
          >
            {t("common.slogan")}
          </p>

          <a
            href="#"
            className="sm:hidden mt-6 text-center text-white border border-white/40 hover:border-yellow-300 hover:text-yellow-300 transition uppercase font-bold text-sm py-3"
          >
            {t("common.buyTicket")}
          </a>
        </div>
      </div>

      <div className="relative w-full h-screen">
        <Image
          src={UkrainianImg}
          alt="Ukrainian Day"
          fill
          priority
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute bottom-10 left-6 md:left-12 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-wider">
            {t("ukrainianDay.title")}
          </h1>
          <p className="mt-2 text-sm opacity-80">
            {t("ukrainianDay.dateLine")}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-6 uppercase leading-relaxed text-sm md:text-base">
        <p className="text-white/80">{t("ukrainianDay.p1")}</p>
        <p className="text-white/80">{t("ukrainianDay.p2")}</p>
        <p className="text-white/80">{t("ukrainianDay.p3")}</p>
        <p className="text-yellow-300 font-semibold">{t("ukrainianDay.highlight")}</p>
        <p className="text-white/80">{t("ukrainianDay.p4")}</p>
        <p className="text-white font-bold mt-4">{t("ukrainianDay.closing")}</p>
      </div>
    </main>
  );
}
