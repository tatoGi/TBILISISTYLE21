"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { navItems } from "./navItems";
import LanguageSwitcher from "./LanguageSwitcher";


type FestivalMenuProps = {
  navOpen: boolean;
  setNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function FestivalMenu({ navOpen, setNavOpen }: FestivalMenuProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const isFestivalPage = pathname === "/dashboard/festival";

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-4 px-5 py-5 ${isFestivalPage ? 'bg-transparent' : 'bg-black/95 backdrop-blur-md'}`}>

        <Link
          href="/dashboard/festival"
          className="flex shrink-0 items-center"
          aria-label="Tbilisi Style 21"
        >
          <span className="max-w-[44vw] text-[clamp(0.95rem,4.5vw,2.25rem)] font-extrabold uppercase leading-none tracking-normal text-white sm:max-w-none sm:text-4xl sm:tracking-wider">
            Tbilisi Style 21
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/dashboard/tickets"
            className="rounded-full border border-yellow-300/60 bg-yellow-300 px-4 py-2 text-xs font-extrabold uppercase tracking-normal text-black shadow-[0_0_24px_rgba(253,224,71,0.28)] transition-all duration-200 hover:bg-white hover:border-white"
          >
            {t("common.buyTickets")}
          </Link>

          <button
            onClick={() => setNavOpen(!navOpen)}
            className="relative z-50 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/25 backdrop-blur-md"
          >
            <span
              className="absolute h-[2px] w-5 bg-white transition-transform duration-200"
              style={{
                transform: navOpen ? "rotate(45deg)" : "translateY(-6px)",
              }}
            />
            <span
              className="absolute h-[2px] w-5 bg-white transition-opacity duration-200"
              style={{ opacity: navOpen ? 0 : 1 }}
            />
            <span
              className="absolute h-[2px] w-5 bg-white transition-transform duration-200"
              style={{
                transform: navOpen ? "rotate(-45deg)" : "translateY(6px)",
              }}
            />
          </button>
        </div>
      </div>

      <div
        className="fixed inset-0 z-40 bg-black transition-opacity"
        style={{
          opacity: navOpen ? 0.6 : 0,
          pointerEvents: navOpen ? "auto" : "none",
        }}
        onClick={() => setNavOpen(false)}
      />

      {/* DRAWER */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-[360px] max-w-full bg-black/90 backdrop-blur-md transition-transform"
        style={{
          transform: navOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="h-full flex flex-col px-8 pt-28 pb-8 overflow-y-auto relative">

          <button
            onClick={() => setNavOpen(false)}
            className="absolute top-6 right-6 w-8 h-8"
          >
            <span className="w-6 h-[2px] bg-white rotate-45 absolute" />
            <span className="w-6 h-[2px] bg-white -rotate-45 absolute" />
          </button>

          <div className="mb-8">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
              {t("common.language")}
            </p>
            <LanguageSwitcher />
          </div>

          <nav className="flex flex-col flex-1 justify-center gap-0">
            {navItems.map((item, i) => (
              <Link
                key={item.labelKey}
                href={item.href}
                onClick={() => setNavOpen(false)}
                className="uppercase font-bold text-white hover:text-yellow-300 hover:pl-2 transition-all duration-200 block"
                style={{
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: "0.1em",
                  fontSize: "clamp(0.75rem, 2.2vh, 1.05rem)",
                  padding: "10px 0",
                  borderBottom:
                    i < navItems.length - 1
                      ? "1px solid rgba(255,255,255,0.07)"
                      : "none",
                }}
              >
                {t(`nav.${item.labelKey}`)}
              </Link>
            ))}
          </nav>

          <div className="w-full h-[1px] bg-white/20 my-4" />

          <p className="text-white/50 uppercase text-xs leading-6">
            {t("common.slogan")}
          </p>
        </div>
      </div>
    </>
  );
}
