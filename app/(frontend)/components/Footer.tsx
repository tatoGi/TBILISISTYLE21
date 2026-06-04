"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const EMAIL = "Tbilisistyle21@gmail.com";
const PHONE_DISPLAY = "+995 558 35 83 62";
const PHONE_HREF = "+995558358362";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/95 px-6 py-12 text-white backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-start">
        {/* Contact */}
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.28em] text-yellow-300/80">
            {t("contactUs.title")}
          </p>
          <a
            href={`mailto:${EMAIL}`}
            className="text-sm font-medium tracking-wide text-white/80 transition-colors hover:text-yellow-300"
          >
            {t("contactUs.email")}: {EMAIL}
          </a>
          <a
            href={`tel:${PHONE_HREF}`}
            className="text-sm font-medium tracking-wide text-white/80 transition-colors hover:text-yellow-300"
          >
            {t("contactUs.phone")}: {PHONE_DISPLAY}
          </a>
          <Link
            href="/dashboard/contactUs"
            className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-white/55 transition-colors hover:text-yellow-300"
          >
            {t("contactUs.title")} →
          </Link>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col items-center gap-3 md:items-end">
          <Link
            href="/dashboard/tickets"
            className="rounded-full bg-yellow-300 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wide text-black shadow-[0_0_24px_rgba(253,224,71,0.28)] transition-all duration-200 hover:bg-white"
          >
            {t("common.buyTickets")}
          </Link>
          <Link
            href="/dashboard/shop"
            className="rounded-full border border-white/25 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white transition-all duration-200 hover:border-yellow-300 hover:text-yellow-300"
          >
            {t("nav.shop")}
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-center text-[11px] uppercase tracking-[0.2em] text-white/35">
        © {new Date().getFullYear()} Tbilisi Style 21
      </div>
    </footer>
  );
}
