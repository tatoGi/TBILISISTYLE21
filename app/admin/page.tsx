import type { Metadata } from "next";
import Link from "next/link";
import { isAdminConfigured, isAdminSession } from "@/lib/admin-auth";
import { loginAdmin } from "./actions";
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

function LoginField({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-white/80">
      {label}
      <input
        className="h-11 border border-white/15 bg-white/10 px-3 text-white outline-none transition focus:border-yellow-300"
        name={name}
        type={type}
        required={required}
      />
    </label>
  );
}

function LoginForm({ error }: { error?: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-5 text-white">
      <form
        action={loginAdmin}
        className="grid w-full max-w-sm gap-5 border border-white/10 p-6"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
            Tbilisi Style 21
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase">Admin</h1>
        </div>

        {!isAdminConfigured() ? (
          <p className="border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100">
            ADMIN_PASSWORD is not configured yet.
          </p>
        ) : null}

        {error ? (
          <p className="border border-yellow-300/40 bg-yellow-300/10 p-3 text-sm text-yellow-100">
            Password is incorrect or the session has expired.
          </p>
        ) : null}

        <LoginField label="Password" name="password" type="password" required />
        <button className="h-11 bg-yellow-300 px-5 text-sm font-black uppercase text-black transition hover:bg-white">
          Login
        </button>
      </form>
    </main>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const authenticated = await isAdminSession();

  if (!authenticated) {
    return <LoginForm error={params.error} />;
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
