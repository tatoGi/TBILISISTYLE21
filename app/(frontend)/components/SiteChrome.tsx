"use client";

import { usePathname } from "next/navigation";
import FestivalMenu, { type NavLink } from "./FestivalMenu";
import Footer from "./Footer";
import TicketCta from "./TicketCta";

// Routes that render their own full-screen / standalone UI and must NOT get the
// shared header, footer and burger menu.
function isBareRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/" || // landing splash ("ENTER THE ENERGY")
    pathname === "/admin-login" ||
    pathname.startsWith("/_legacy-admin")
  );
}

/**
 * Single source of the site chrome (menu + footer + floating ticket CTA) for
 * the whole public site, so every page — dashboard routes AND CMS `[slug]`
 * pages like /main-stage — shares one consistent layout.
 */
export default function SiteChrome({
  pages,
  children,
}: {
  pages: NavLink[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (isBareRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white">
      <FestivalMenu pages={pages} />
      <div className="flex-1">{children}</div>
      <Footer />
      <TicketCta />
    </div>
  );
}
