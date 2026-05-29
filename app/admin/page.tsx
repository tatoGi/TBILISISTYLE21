import type { Metadata } from "next";
import Link from "next/link";
import { isAdminConfigured, isAdminSession } from "@/lib/admin-auth";
import { AdminLoginForm } from "./_components/AdminLoginForm";
import { AdminShell } from "./_components/AdminShell";
import { DashboardStats } from "./_components/DashboardStats";

export const metadata: Metadata = {
  title: "Admin | Tbilisi Style 21",
};

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const quickLinks = [
  {
    href: "/admin/tickets",
    title: "Ticket Types",
    description: "Create, edit and publish ticket types visible on the public site.",
    color: "amber",
  },
  {
    href: "/admin/sold-tickets",
    title: "Sold Tickets",
    description: "Browse every paid ticket buyer, their payment status and details.",
    color: "emerald",
  },
  {
    href: "/admin/joker-tickets",
    title: "Joker Tickets",
    description: "Members who purchased the special Joker ticket category.",
    color: "fuchsia",
  },
  {
    href: "/admin/scan",
    title: "Scanner",
    description: "Open the entrance camera scanner to validate QR codes.",
    color: "sky",
  },
] as const;

const colorClasses: Record<(typeof quickLinks)[number]["color"], string> = {
  amber: "border-amber-200 hover:border-amber-400 hover:bg-amber-50",
  emerald: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50",
  fuchsia: "border-fuchsia-200 hover:border-fuchsia-400 hover:bg-fuchsia-50",
  sky: "border-sky-200 hover:border-sky-400 hover:bg-sky-50",
};

const colorBadge: Record<(typeof quickLinks)[number]["color"], string> = {
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  fuchsia: "bg-fuchsia-100 text-fuchsia-700",
  sky: "bg-sky-100 text-sky-700",
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const authenticated = await isAdminSession();

  if (!authenticated) {
    return (
      <AdminLoginForm
        configured={isAdminConfigured()}
        initialError={params.error}
      />
    );
  }

  return (
    <AdminShell title="Dashboard" eyebrow="Overview">
      <DashboardStats />

      <section className="grid gap-3">
        <h2 className="text-base font-bold text-slate-900">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-start gap-4 rounded-2xl border-2 bg-white p-5 shadow-sm transition ${colorClasses[item.color]}`}
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${colorBadge[item.color]}`}
              >
                {item.title[0]}
              </span>
              <span className="grid gap-1">
                <span className="text-base font-bold text-slate-900">
                  {item.title}
                </span>
                <span className="text-sm leading-6 text-slate-600">
                  {item.description}
                </span>
              </span>
              <span className="ml-auto self-center text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
