"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { navItems } from "./navItems";
import LanguageSwitcher from "./LanguageSwitcher";

export type NavLink = { label: string; href: string };

type FestivalMenuProps = {
  /** CMS-driven content links (Pages flagged "Show in site menu"). */
  pages?: NavLink[];
};

export default function FestivalMenu({ pages = [] }: FestivalMenuProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const isFestivalPage = pathname === "/dashboard/festival";
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [navOpen]);

  // Functional routes are not CMS content — keep them fixed.
  const functional: NavLink[] = [
    { label: t("nav.ticket"), href: "/dashboard/tickets" },
    { label: t("nav.shop"), href: "/dashboard/shop" },
  ];

  // CMS pages + functional links; fall back to the static list if the CMS
  // returns nothing, so the menu is never empty.
  const links: NavLink[] = pages.length
    ? [...pages, ...functional]
    : navItems.map((item) => ({ label: t(`nav.${item.labelKey}`), href: item.href }));

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-4 px-5 py-5 ${isFestivalPage ? 'bg-transparent' : 'bg-black/95 backdrop-blur-md'}`}>

        <Link
          href="/dashboard/festival"
          className="flex shrink-0 items-center gap-2 sm:gap-3"
          aria-label="Tbilisi Style 21"
        >
          <Image
            src="/images/logo2.jpeg"
            alt="Tbilisi Style 21"
            width={44}
            height={44}
            priority
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white/30 sm:h-11 sm:w-11"
          />
          <span className="max-w-[40vw] text-[clamp(0.95rem,4.5vw,2.25rem)] font-extrabold uppercase leading-none tracking-normal text-white sm:max-w-none sm:text-4xl sm:tracking-wider">
            Tbilisi Style 21
          </span>
        </Link>

        {/* Language switcher — centered on desktop */}
        <div className="pointer-events-none absolute inset-x-0 hidden justify-center sm:flex">
          <div className="pointer-events-auto">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* On mobile (no centered slot, no hover) keep the switcher inline */}
          <div className="sm:hidden">
            <LanguageSwitcher />
          </div>

          <button
            onClick={() => setNavOpen(!navOpen)}
            onMouseEnter={() => setNavOpen(true)}
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
        onMouseLeave={() => setNavOpen(false)}
      >
        <div className="h-full flex flex-col px-8 pt-28 pb-8 overflow-y-auto relative">

          <button
            onClick={() => setNavOpen(false)}
            className="absolute top-6 right-6 w-8 h-8"
          >
            <span className="w-6 h-[2px] bg-white rotate-45 absolute" />
            <span className="w-6 h-[2px] bg-white -rotate-45 absolute" />
          </button>

          <nav className="flex flex-col flex-1 justify-center gap-0">
            {links.map((item, i) => (
              <Link
                key={`${item.href}-${i}`}
                href={item.href}
                onClick={() => setNavOpen(false)}
                className="uppercase font-bold text-white hover:text-yellow-300 hover:pl-2 transition-all duration-200 block"
                style={{
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: "0.1em",
                  fontSize: "clamp(0.75rem, 2.2vh, 1.05rem)",
                  padding: "10px 0",
                  borderBottom:
                    i < links.length - 1
                      ? "1px solid rgba(255,255,255,0.07)"
                      : "none",
                }}
              >
                {item.label}
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
