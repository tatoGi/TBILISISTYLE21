import Link from "next/link";
import { getPayload, type Where } from "payload";
import config from "@payload-config";

type CountConfig = {
  label: string;
  collection:
    | "pages"
    | "posts"
    | "tickets"
    | "products"
    | "soldTickets"
    | "productOrders"
    | "jokerTickets"
    | "messageJobs"
    | "media";
  href: string;
  tone: "amber" | "emerald" | "sky" | "violet" | "rose" | "slate";
  where?: Where;
};

const stats: CountConfig[] = [
  {
    label: "Pages",
    collection: "pages",
    href: "/admin/collections/pages",
    tone: "violet",
  },
  {
    label: "News",
    collection: "posts",
    href: "/admin/collections/posts",
    tone: "sky",
  },
  {
    label: "Tickets",
    collection: "tickets",
    href: "/admin/collections/tickets",
    tone: "amber",
  },
  {
    label: "Products",
    collection: "products",
    href: "/admin/collections/products",
    tone: "emerald",
  },
  {
    label: "Paid Tickets",
    collection: "soldTickets",
    href: "/admin/collections/soldTickets",
    tone: "rose",
    where: { status: { equals: "paid" } },
  },
  {
    label: "Product Orders",
    collection: "productOrders",
    href: "/admin/collections/productOrders",
    tone: "slate",
  },
];

const quickLinks = [
  {
    title: "Create Page",
    description: "Build a localized content page with flexible blocks.",
    href: "/admin/collections/pages/create",
    tone: "violet",
  },
  {
    title: "Write News",
    description: "Publish festival updates, announcements and stories.",
    href: "/admin/collections/posts/create",
    tone: "sky",
  },
  {
    title: "Ticket Catalog",
    description: "Edit ticket prices, quantities and sale status.",
    href: "/admin/collections/tickets",
    tone: "amber",
  },
  {
    title: "Merch Store",
    description: "Manage products, stock by size and VIP badges.",
    href: "/admin/collections/products",
    tone: "emerald",
  },
  {
    title: "Scanner",
    description: "Validate QR codes at the entrance.",
    href: "/admin/scanner",
    tone: "rose",
  },
  {
    title: "Email Queue",
    description: "Inspect ticket email delivery jobs.",
    href: "/admin/collections/messageJobs",
    tone: "slate",
  },
] as const;

const toneClasses = {
  amber: { card: "border-amber-200 bg-amber-50", icon: "bg-amber-500 text-white", text: "text-amber-700" },
  emerald: { card: "border-emerald-200 bg-emerald-50", icon: "bg-emerald-500 text-white", text: "text-emerald-700" },
  rose: { card: "border-rose-200 bg-rose-50", icon: "bg-rose-500 text-white", text: "text-rose-700" },
  sky: { card: "border-sky-200 bg-sky-50", icon: "bg-sky-500 text-white", text: "text-sky-700" },
  slate: { card: "border-slate-200 bg-slate-50", icon: "bg-slate-900 text-white", text: "text-slate-700" },
  violet: { card: "border-violet-200 bg-violet-50", icon: "bg-violet-500 text-white", text: "text-violet-700" },
};

async function getCount(item: CountConfig) {
  try {
    const payload = await getPayload({ config });
    const result = await payload.count({
      collection: item.collection,
      where: item.where,
    });

    return result.totalDocs;
  } catch {
    return 0;
  }
}

export default async function DashboardView() {
  const counts = await Promise.all(stats.map(getCount));

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8">
        <section className="overflow-hidden rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white text-slate-900 shadow-xl shadow-amber-100/60">
          <div className="grid gap-8 p-7 md:grid-cols-[1.2fr_0.8fr] md:p-10">
            <div className="grid content-center gap-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">
                Tbilisi Style 21
              </p>
              <div className="grid gap-3">
                <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                  Admin Dashboard
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                  Content, tickets, merch, orders and entrance control in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/scanner"
                  className="inline-flex h-11 items-center rounded-xl bg-amber-400 px-5 text-sm font-black text-slate-950 transition hover:bg-amber-300"
                >
                  Open Scanner
                </Link>
                <Link
                  href="/admin/collections/pages/create"
                  className="inline-flex h-11 items-center rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
                >
                  New Page
                </Link>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Live Overview
              </p>
              <div className="grid grid-cols-2 gap-3">
                {stats.slice(0, 4).map((item, index) => (
                  <Link
                    key={item.collection}
                    href={item.href}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <p className="text-3xl font-black">{counts[index]}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                      {item.label}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((item, index) => {
            const tone = toneClasses[item.tone];

            return (
              <Link
                key={item.collection}
                href={item.href}
                className={`group rounded-2xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${tone.card}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-xs font-black uppercase tracking-[0.18em] ${tone.text}`}>
                      {item.label}
                    </p>
                    <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                      {counts[index]}
                    </p>
                  </div>
                  <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone.icon}`}>
                    {item.label.slice(0, 1)}
                  </span>
                </div>
                <p className="mt-4 text-sm font-bold text-slate-500 transition group-hover:text-slate-800">
                  View collection
                </p>
              </Link>
            );
          })}
        </section>

        <section className="grid gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-600">
              Quick Links
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              Frequent Actions
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickLinks.map((item) => {
              const tone = toneClasses[item.tone];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
                >
                  <span className={`inline-grid h-10 w-10 place-items-center rounded-xl ${tone.icon}`}>
                    {item.title.slice(0, 1)}
                  </span>
                  <h3 className="mt-4 text-lg font-black text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                  <p className={`mt-4 text-sm font-black ${tone.text}`}>
                    Open
                    <span className="inline-block transition group-hover:translate-x-1">
                      {" "}
                      →
                    </span>
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
