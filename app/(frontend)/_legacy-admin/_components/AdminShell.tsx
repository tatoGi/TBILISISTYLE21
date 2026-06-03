"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode, type SVGProps } from "react";
import { AdminLogoutButton } from "./AdminLogoutButton";

type NavItem = {
  href: string;
  label: string;
  Icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
};

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", Icon: HomeIcon },
  { href: "/admin", label: "CMS", Icon: CmsIcon },
  { href: "/admin/tickets", label: "Ticket Types", Icon: TicketIcon },
  { href: "/admin/products", label: "Products", Icon: BagIcon },
  { href: "/admin/product-orders", label: "Product Orders", Icon: BoxIcon },
  { href: "/admin/sold-tickets", label: "Sold Tickets", Icon: ListIcon },
  { href: "/admin/joker-tickets", label: "Joker Tickets", Icon: StarIcon },
  { href: "/admin/emails", label: "Email Queue", Icon: EnvelopeIcon },
  { href: "/admin/scan", label: "Scanner", Icon: QrIcon },
];

export function AdminShell({
  title,
  eyebrow,
  actions,
  children,
}: {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Link href="/admin" className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
          TS21 <span className="text-amber-500">Admin</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50"
          aria-label="Open menu"
        >
          Menu
        </button>
      </header>

      {/* Sidebar backdrop (mobile) */}
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="flex">
        {/* Sidebar — dark */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Brand */}
          <div className="border-b border-white/10 px-5 py-5">
            <Link
              href="/admin"
              className="flex items-center gap-3"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-400 text-sm font-black text-slate-900">
                TS
              </span>
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Tbilisi Style 21
                </span>
                <span className="block text-sm font-extrabold uppercase tracking-wide text-white">
                  Admin
                </span>
              </span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="grid gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                        isActive
                          ? "bg-amber-400 text-slate-900 shadow-sm"
                          : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <item.Icon
                        className={`h-4 w-4 ${
                          isActive
                            ? "text-slate-900"
                            : "text-slate-500 group-hover:text-amber-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="border-t border-white/10 p-3">
            <AdminLogoutButton />
          </div>
        </aside>

        {/* Main content — light */}
        <main className="min-w-0 flex-1 bg-slate-100">
          <div className="mx-auto w-full max-w-7xl px-5 py-6 md:px-8 md:py-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600">
                  {eyebrow ?? "Admin"}
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                  {title}
                </h1>
              </div>
              {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
            </div>

            <div className="grid gap-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Icons (inline SVG, no deps) ---

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function CmsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </svg>
  );
}

function TicketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
      <path d="M12 7v10" strokeDasharray="2 2" />
    </svg>
  );
}

function BagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function BoxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function ListIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2" />
    </svg>
  );
}

function EnvelopeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function QrIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <path d="M14 14h3v3M21 21v-3M14 21h3M21 14h-3" />
    </svg>
  );
}
