import Link from "next/link";
import type { ReactNode } from "react";
import { getPgPool } from "@/lib/payload";
import { Button, Card, CardBody, CardHeader, PageHeader, Progress } from "./_ui";
import { RevenueAreaChart, SalesByTypeDonut } from "./charts/DashboardCharts";

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
  const pool = await getPgPool();

  const [
    revenue,
    inventory,
    ticketsSold,
    productOrdersPaid,
    pending,
    scanned,
    emailsPending,
    emailsFailed,
    ticketTypes,
    products,
  ] = await Promise.all([
    pool.query(`
      SELECT
        COALESCE((SELECT SUM(amount) FROM sold_tickets WHERE status IN ('paid', 'scanned')), 0)
        + COALESCE((SELECT SUM(amount) FROM product_orders WHERE status IN ('paid', 'collected')), 0) AS total
    `),
    pool.query(`
      SELECT
        COALESCE((SELECT SUM(quantity) FROM tickets), 0)
        + COALESCE((SELECT SUM(quantity) FROM products_sizes), 0) AS remaining
    `),
    pool.query("SELECT COUNT(*) AS total FROM sold_tickets WHERE status IN ('paid', 'scanned')"),
    pool.query("SELECT COUNT(*) AS total FROM product_orders WHERE status IN ('paid', 'collected')"),
    pool.query(`
      SELECT
        COALESCE((SELECT COUNT(*) FROM sold_tickets WHERE status = 'pending'), 0)
        + COALESCE((SELECT COUNT(*) FROM product_orders WHERE status = 'pending'), 0) AS total
    `),
    pool.query("SELECT COUNT(*) AS total FROM sold_tickets WHERE status = 'scanned' OR scanned_at IS NOT NULL"),
    pool.query("SELECT COUNT(*) AS total FROM message_jobs WHERE status IN ('pending', 'processing')"),
    pool.query("SELECT COUNT(*) AS total FROM message_jobs WHERE status = 'failed'"),
    pool.query("SELECT COUNT(*) AS total FROM tickets"),
    pool.query("SELECT COUNT(*) AS total FROM products"),
  ]);

  return {
    revenueGel: Number(revenue.rows[0]?.total ?? 0),
    inventoryRemaining: Number(inventory.rows[0]?.remaining ?? 0),
    paidOrders: Number(ticketsSold.rows[0]?.total ?? 0) + Number(productOrdersPaid.rows[0]?.total ?? 0),
    productOrdersPaid: Number(productOrdersPaid.rows[0]?.total ?? 0),
    ticketsSold: Number(ticketsSold.rows[0]?.total ?? 0),
    pending: Number(pending.rows[0]?.total ?? 0),
    scanned: Number(scanned.rows[0]?.total ?? 0),
    emailsPending: Number(emailsPending.rows[0]?.total ?? 0),
    emailsFailed: Number(emailsFailed.rows[0]?.total ?? 0),
    ticketTypes: Number(ticketTypes.rows[0]?.total ?? 0),
    products: Number(products.rows[0]?.total ?? 0),
  };
}

async function loadChartData() {
  const pool = await getPgPool();
  const [byDay, byType] = await Promise.all([
    pool.query(
      `SELECT to_char(day, 'DD Mon') AS day, COALESCE(SUM(amount), 0) AS total
       FROM (
         SELECT date_trunc('day', paid_at) AS day, amount
         FROM sold_tickets
         WHERE status IN ('paid', 'scanned') AND paid_at IS NOT NULL
           AND paid_at >= now() - interval '30 days'
         UNION ALL
         SELECT date_trunc('day', paid_at) AS day, amount
         FROM product_orders
         WHERE status IN ('paid', 'collected') AND paid_at IS NOT NULL
           AND paid_at >= now() - interval '30 days'
       ) sales
       GROUP BY day
       ORDER BY day`
    ),
    pool.query(
      `SELECT label, COALESCE(SUM(amount), 0) AS total
       FROM (
         SELECT COALESCE(NULLIF(event_name, ''), 'Ticket') AS label, amount
         FROM sold_tickets
         WHERE status IN ('paid', 'scanned')
         UNION ALL
         SELECT COALESCE(NULLIF(product_title, ''), 'Product') AS label, amount
         FROM product_orders
         WHERE status IN ('paid', 'collected')
       ) sales
       GROUP BY label
       ORDER BY total DESC
       LIMIT 6`
    ),
  ]);

  return {
    revenueDays: byDay.rows.map((r) => String(r.day)),
    revenueTotals: byDay.rows.map((r) => Number(r.total)),
    typeLabels: byType.rows.map((r) => String(r.label)),
    typeValues: byType.rows.map((r) => Number(r.total)),
  };
}

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

export default async function DashboardView() {
  const [s, charts] = await Promise.all([loadStats(), loadChartData()]);

  const kpis: Kpi[] = [
    {
      label: "Total revenue",
      value: `${fmt(s.revenueGel)} GEL`,
      hint: `from ${fmt(s.paidOrders)} paid ticket/product orders`,
      tone: "emerald",
      href: "/admin/sold-tickets",
      icon: <MoneyIcon />,
    },
    {
      label: "Tickets sold",
      value: fmt(s.ticketsSold),
      hint: `${s.productOrdersPaid} paid product orders / ${s.pending} pending`,
      tone: "amber",
      href: "/admin/sold-tickets",
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
      href: "/admin/tickets",
      icon: <BoxIcon />,
    },
    {
      label: "Email queue",
      value: fmt(s.emailsPending + s.emailsFailed),
      hint: `${s.emailsFailed} failed / ${s.emailsPending} pending`,
      tone: s.emailsFailed > 0 ? "rose" : "violet",
      href: "/admin/emails",
      icon: <EnvelopeIcon />,
    },
    {
      label: "Products",
      value: fmt(s.products),
      hint: "items in the shop",
      tone: "violet",
      href: "/admin/products",
      icon: <BagIcon />,
    },
  ];

  return (
    <div className="ts21-admin-view">
      <div className="mx-auto grid max-w-7xl gap-7">
        <PageHeader
          eyebrow="Tbilisi Style 21"
          title="Dashboard"
          description="Tickets, merch, orders and entrance control - live overview."
          actions={
            <>
              <Button href="/admin/scanner" className="bg-[#405189] hover:bg-[#364574]" icon={<QrIcon />}>
                Open Scanner
              </Button>
              <Button href="/admin/collections/pages/create" color="slate" variant="outline" icon={<PlusIcon />}>
                New Page
              </Button>
            </>
          }
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((k) => (
            <Link
              key={k.label}
              href={k.href}
              className={`group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tone[k.tone].ring}`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500">{k.label}</p>
                  <p className={`mt-3 text-3xl font-black tracking-tight ${tone[k.tone].value}`}>{k.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{k.hint}</p>
                  {k.label === "Inventory remaining" ? (
                    <Progress value={Math.min(100, s.inventoryRemaining)} className="mt-4" tone="primary" />
                  ) : null}
                </div>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${tone[k.tone].tile}`}>
                  {k.icon}
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader actions={<span className="text-xs font-semibold text-slate-400">paid tickets / GEL</span>}>
              <h2 className="text-base font-bold text-slate-900">Revenue (last 30 days)</h2>
            </CardHeader>
            <CardBody>
              {charts.revenueTotals.length ? (
                <RevenueAreaChart days={charts.revenueDays} totals={charts.revenueTotals} />
              ) : (
                <EmptyChart label="No paid sales in the last 30 days yet." />
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-base font-bold text-slate-900">Sales by ticket type</h2>
            </CardHeader>
            <CardBody>
              {charts.typeValues.length ? (
                <SalesByTypeDonut labels={charts.typeLabels} values={charts.typeValues} />
              ) : (
                <EmptyChart label="No paid sales yet." />
              )}
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-[320px] place-items-center rounded-lg border border-dashed border-slate-200 text-center">
      <p className="px-6 text-sm text-slate-500">{label}</p>
    </div>
  );
}

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

function QrIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M16 16h2v2h-2zM20 16h1v5h-5v-1M11 3h2M11 8h2M11 16h2M16 11h5M3 11h5M11 21h2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
