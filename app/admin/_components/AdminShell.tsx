import Link from "next/link";
import type { ReactNode } from "react";
import { AdminLogoutButton } from "./AdminLogoutButton";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/tickets", label: "Ticket Types" },
  { href: "/admin/sold-tickets", label: "Sold Tickets" },
  { href: "/admin/joker-tickets", label: "Joker Tickets" },
  { href: "/admin/scan", label: "Scanner" },
];

export function AdminShell({
  title,
  eyebrow = "Tbilisi Style 21",
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8">
        <header className="grid gap-5 border-b border-white/10 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
                {eyebrow}
              </p>
              <h1 className="mt-2 text-3xl font-black uppercase">{title}</h1>
            </div>
            <AdminLogoutButton />
          </div>

          <nav className="flex flex-wrap gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border border-white/15 px-4 py-3 text-xs font-bold uppercase text-white transition hover:border-yellow-300 hover:text-yellow-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        {children}
      </div>
    </main>
  );
}
