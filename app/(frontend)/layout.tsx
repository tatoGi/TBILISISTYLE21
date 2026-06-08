import type { Metadata } from "next";
import { Noto_Sans_Georgian, Unbounded } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { defaultLocale, isLocale, localeCookieName } from "@/i18n/config";
import { getNavPages } from "@/lib/nav";
import SiteChrome from "./components/SiteChrome";
import "./globals.css";

const notoSansGeorgian = Noto_Sans_Georgian({
  variable: "--font-display",
  subsets: ["georgian", "latin", "cyrillic-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Display/heading face for the festival look. Latin + Cyrillic only — Georgian
// glyphs fall back to Noto Sans Georgian via the --font-heading stack in CSS.
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tbilisi Style 21",
  description: "Electronic Music Festival",
  icons: {
    icon: "/images/logo2.jpeg",
    shortcut: "/images/logo2.jpeg",
    apple: "/images/logo2.jpeg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await cookies();
  const requestedLocale = store.get(localeCookieName)?.value;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const pages = await getNavPages();

  return (
    <html
      lang={locale}
      className={`${notoSansGeorgian.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <SiteChrome pages={pages}>{children}</SiteChrome>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
