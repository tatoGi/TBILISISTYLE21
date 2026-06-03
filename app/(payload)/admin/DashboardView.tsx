import Link from "next/link";
import type { ReactNode } from "react";
import { getPayloadClient, getPgPool } from "@/lib/payload";

export const dynamic = "force-dynamic";

type Tone = "amber" | "emerald" | "sky" | "violet" | "rose" | "slate";

const tone: Record<Tone, { tile: string; value: string; ring: string }> = {
  amber: { tile: "bg-amber-100 text-amber-700", value: "text-amber-700", ring: "hover:border-amber-300" },
  emerald: { tile: "bg-emerald-100 text-emerald-700", value: "text-emerald-700", ring: "hover:border-emerald-300" },
  sky: { tile: "bg-sky-100 text-sky-700", value: "text-sky-700", ring: "hover:border-sky-300" },
  violet: { tile: "bg-violet-100 text-violet-700", value: "text-violet-700", ring: "hover:border-violet-300" },
  rose: { tile: "bg-rose-100 text-rose-700", value: "text-rose-700", ring: "hover:border-rose-300" },
  slate: { tile: "bg-slate-100 text-slate-700", value: "text-slate-900", ring: "hover:border-slate-300" },
};

type Kpi = {
  label: string;
  value: string;
  hint: string;
  tone: Tone;
  icon: ReactNode;
  href: string;
};

async function loadStats() {
  const payload = await getPayloadClient();
  const pool = await getPgPool();

  const countSold = (where: Record<string, unknown>) =>
    payload.count({ collection: "soldTickets", where: where as never }).then((r) => r.totalDocs);

  const [
    revenue,
    inventory,
    ticketsSold,
    pending,
    scanned,
    emailsPending,
    emailsFailed,
    ticketTypes,
    products,
  ] = await Promise.all([
    pool.query("SELECT COALESCE(SUM(amount), 0) AS total FROM sold_tickets WHERE status = 'paid'"),
    pool.query("SELECT COALESCE(SUM(quantity), 0) AS remaining FROM tickets"),
    countSold({ status: { equals: "paid" } }),
    countSold({ status: { equals: "pending" } }),
    countSold({ and: [{ status: { equals: "paid" } }, { scannedAt: { exists: true } }] }),
    payload.count({ collection: "messageJobs", where: { status: { in: ["pending", "processing"] } } }).then((r) => r.totalDocs),
    payload.count({ collection: "messageJobs", where: { status: { equals: "failed" } } }).then((r) => r.totalDocs),
    payload.count({ collection: "tickets" }).then((r) => r.totalDocs),
    payload.count({ collection: "products" }).then((r) => r.totalDocs),
  ]);

  return {
    revenueGel: Number(revenue.rows[0]?.total ?? 0),
    inventoryRemaining: Number(inventory.rows[0]?.remaining ?? 0),
    ticketsSold,
    pending,
    scanned,
    emailsPending,
    emailsFailed,
    ticketTypes,
    products,
  };
}

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

export default async function DashboardView() {
  const s = await loadStats();

  const kpis: Kpi[] = [
    {
      label: "Total revenue",
      value: `${fmt(s.revenueGel)} ₾`,
      hint: `from ${fmt(s.ticketsSold)} paid tickets`,
      tone: "emerald",
      href: "/admin/collections/soldTickets?where[status][equals]=paid",
      icon: <MoneyIcon />,
    },
    {
      label: "Tickets sold",
      value: fmt(s.ticketsSold),
      hint: `${s.pending} payment${s.pending === 1 ? "" : "s"} pending`,
      tone: "amber",
      href: "/admin/collections/soldTickets",
      icon: <TicketIcon />,
    },
    {
      label: "Entries scanned",
      value: fmt(s.scanned),
      hint: "validated at the gate",
      tone: "sky",
      href: "/admin/scanner",
      icon: <CheckIcon />,
    },
    {
      label: "Inventory remaining",
      value: fmt(s.inventoryRemaining),
      hint: `${s.ticketTypes} ticket types`,
      tone: "slate",
      href: "/admin/collections/tickets",
      icon: <BoxIcon />,
    },
    {
      label: "Email queue",
      value: fmt(s.emailsPending + s.emailsFailed),
      hint: `${s.emailsFailed} failed · ${s.emailsPending} pending`,
      tone: s.emailsFailed > 0 ? "rose" : "violet",
      href: "/admin/collections/messageJobs",
      icon: <EnvelopeIcon />,
    },
    {
      label: "Products",
      value: fmt(s.products),
      hint: "items in the shop",
      tone: "violet",
      href: "/admin/collections/products",
      icon: <BagIcon />,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-7 text-slate-900 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-7">
        {/* Page header */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600">
              Tbilisi Style 21
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Tickets, merch, orders and entrance control — live overview.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/scanner"
              className="inline-flex h-10 items-center rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
            >
              Open Scanner
            </Link>
            <Link
              href="/admin/collections/pages/create"
              className="inline-flex h-10 items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
            >
              New Page
            </Link>
          </div>
        </header>

        {/* KPI cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((k) => (
            <Link
              key={k.label}
              href={k.href}
              className={`group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tone[k.tone].ring}`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {k.label}
                  </p>
                  <p className={`mt-3 text-3xl font-black tracking-tight ${tone[k.tone].value}`}>
                    {k.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{k.hint}</p>
                </div>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone[k.tone].tile}`}>
                  {k.icon}
                </span>
              </div>
            </Link>
          ))}
        </section>

        {/* Chart placeholder — filled in next step */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center lg:col-span-2">
            <p className="text-sm font-semibold text-slate-700">Revenue chart</p>
            <p className="mt-1 text-sm text-slate-500">Arrives in the next step (ApexCharts).</p>
          </div>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-slate-700">Sales by type</p>
            <p className="mt-1 text-sm text-slate-500">Coming next.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

// --- Icons ---
function MoneyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function TicketIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
function EnvelopeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
