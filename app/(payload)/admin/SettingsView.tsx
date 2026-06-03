import Link from "next/link";

export const dynamic = "force-dynamic";

const configLinks = [
  { title: "Site Menu", desc: "Reorder the public navigation menu.", href: "/admin/globals/site" },
  { title: "Users", desc: "Admin accounts that can sign in here.", href: "/admin/collections/users" },
  { title: "Ticket Types", desc: "Prices, quantities and sale status.", href: "/admin/collections/tickets" },
  { title: "Products", desc: "Merch catalog and stock by size.", href: "/admin/collections/products" },
  { title: "Media", desc: "Uploaded images (stored in Vercel Blob).", href: "/admin/collections/media" },
];

export default function SettingsView() {
  const adminEmail = process.env.PAYLOAD_ADMIN_EMAIL || "admin@tbilisistyle21.com";

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-7 text-slate-900 md:px-8">
      <div className="mx-auto grid max-w-5xl gap-7">
        <header>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600">
            Account
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Settings</h1>
        </header>

        {/* Account card */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white p-6">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-900 text-2xl font-black text-amber-400">
              A
            </span>
            <div className="min-w-0">
              <p className="text-lg font-black text-slate-900">Administrator</p>
              <p className="truncate text-sm text-slate-500">{adminEmail}</p>
            </div>
            <Link
              href="/admin/logout"
              className="ml-auto inline-flex h-10 items-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
            >
              Sign out
            </Link>
          </div>
          <div className="p-6 text-sm leading-6 text-slate-500">
            Admin access is protected by a shared password and Payload user accounts.
            To change credentials, edit the{" "}
            <Link href="/admin/collections/users" className="font-semibold text-slate-700 underline">
              Users
            </Link>{" "}
            collection (or the <code className="rounded bg-slate-100 px-1">ADMIN_PASSWORD</code> environment variable for the legacy gate).
          </div>
        </section>

        {/* Configuration */}
        <section className="grid gap-4">
          <h2 className="text-base font-bold text-slate-900">Configuration</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {configLinks.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <p className="text-base font-bold text-slate-900">{c.title}</p>
                <p className="mt-1 min-h-10 text-sm text-slate-500">{c.desc}</p>
                <span className="mt-3 inline-block text-sm font-bold text-amber-600 transition group-hover:translate-x-1">
                  Open →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
