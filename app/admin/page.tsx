import type { Metadata } from "next";
import Link from "next/link";
import { isAdminConfigured, isAdminSession } from "@/lib/admin-auth";
import { AdminLoginForm } from "./_components/AdminLoginForm";
import { AdminShell } from "./_components/AdminShell";

export const metadata: Metadata = {
  title: "Admin | Tbilisi Style 21",
};

type AdminPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const dashboardLinks = [
  {
    href: "/admin/tickets",
    title: "Ticket Types",
    description: "Create and edit the ticket types visible on the public tickets page.",
  },
  {
    href: "/admin/sold-tickets",
    title: "Sold Tickets",
    description: "View all paid ticket buyers and payment records.",
  },
  {
    href: "/admin/joker-tickets",
    title: "Joker Tickets",
    description: "View only buyers who purchased a Joker ticket.",
  },
  {
    href: "/admin/scan",
    title: "Scanner",
    description: "Scan QR codes at the entrance and validate tickets.",
  },
];

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
    <AdminShell title="Admin Dashboard">
      <section className="grid gap-4 md:grid-cols-2">
        {dashboardLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="grid gap-3 border border-white/10 bg-white/[0.03] p-5 transition hover:border-yellow-300"
          >
            <h2 className="text-xl font-black uppercase text-yellow-300">
              {item.title}
            </h2>
            <p className="text-sm leading-6 text-white/65">{item.description}</p>
          </Link>
        ))}
      </section>
    </AdminShell>
  );
}
