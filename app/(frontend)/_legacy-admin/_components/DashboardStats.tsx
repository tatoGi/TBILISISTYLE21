import type { Where } from "payload";
import { getPayloadClient, getPgPool } from "@/lib/payload";

type Stats = {
  revenueGel: number;
  ticketsSold: number;
  ticketsToday: number;
  scannedCount: number;
  scannedToday: number;
  pendingCount: number;
  ticketTypes: number;
  emailsPending: number;
  emailsFailed: number;
  totalRemaining: number;
  totalSoldFromInventory: number;
};

async function loadStats(): Promise<Stats> {
  const payload = await getPayloadClient();
  const pool = await getPgPool();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfDayIso = startOfDay.toISOString();

  const countSold = (where: Where) =>
    payload.count({ collection: "soldTickets", where }).then((r) => r.totalDocs);

  const [
    revenueAgg,
    ticketsSold,
    ticketsToday,
    scannedCount,
    scannedToday,
    pendingCount,
    ticketTypes,
    emailsPending,
    emailsFailed,
    inventoryAgg,
  ] = await Promise.all([
    pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM sold_tickets WHERE status = 'paid'"
    ),
    countSold({ status: { equals: "paid" } }),
    countSold({
      and: [{ status: { equals: "paid" } }, { paidAt: { greater_than_equal: startOfDayIso } }],
    }),
    countSold({
      and: [{ status: { equals: "paid" } }, { scannedAt: { exists: true } }],
    }),
    countSold({
      and: [{ status: { equals: "paid" } }, { scannedAt: { greater_than_equal: startOfDayIso } }],
    }),
    countSold({ status: { equals: "pending" } }),
    payload.count({ collection: "tickets" }).then((r) => r.totalDocs),
    payload
      .count({ collection: "messageJobs", where: { status: { in: ["pending", "processing"] } } })
      .then((r) => r.totalDocs),
    payload
      .count({ collection: "messageJobs", where: { status: { equals: "failed" } } })
      .then((r) => r.totalDocs),
    pool.query("SELECT COALESCE(SUM(quantity), 0) AS remaining FROM tickets"),
  ]);

  return {
    revenueGel: Number(revenueAgg.rows[0]?.total ?? 0),
    ticketsSold,
    ticketsToday,
    scannedCount,
    scannedToday,
    pendingCount,
    ticketTypes,
    emailsPending,
    emailsFailed,
    totalRemaining: Number(inventoryAgg.rows[0]?.remaining ?? 0),
    totalSoldFromInventory: ticketsSold,
  };
}

export async function DashboardStats() {
  const s = await loadStats();
  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<MoneyIcon />}
        label="Total revenue"
        value={`${fmt(s.revenueGel)} ₾`}
        hint={`from ${fmt(s.ticketsSold)} paid tickets`}
        accent="amber"
      />
      <StatCard
        icon={<TrendIcon />}
        label="Sold today"
        value={fmt(s.ticketsToday)}
        hint={`${s.pendingCount} payment${s.pendingCount === 1 ? "" : "s"} pending`}
        accent="emerald"
      />
      <StatCard
        icon={<CheckIcon />}
        label="Entries scanned"
        value={fmt(s.scannedCount)}
        hint={`${s.scannedToday} today`}
        accent="sky"
      />
      <StatCard
        icon={<EnvelopeIcon />}
        label="Email queue"
        value={fmt(s.emailsPending + s.emailsFailed)}
        hint={`${s.emailsFailed} failed · ${s.emailsPending} pending`}
        accent={s.emailsFailed > 0 ? "rose" : "slate"}
      />
      <StatCard
        icon={<BoxIcon />}
        label="Ticket types"
        value={fmt(s.ticketTypes)}
        hint="ticket types in catalog"
        accent="slate"
        span={2}
      />
      <StatCard
        icon={<InventoryIcon />}
        label="Inventory remaining"
        value={fmt(s.totalRemaining)}
        hint={`${fmt(s.totalSoldFromInventory)} tickets sold to date`}
        accent="slate"
        span={2}
      />
    </section>
  );
}

type Accent = "amber" | "emerald" | "sky" | "rose" | "slate";

function StatCard({
  icon,
  label,
  value,
  hint,
  accent,
  span,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent: Accent;
  span?: 2;
}) {
  const accents: Record<Accent, { tile: string; text: string }> = {
    amber:   { tile: "bg-amber-100 text-amber-700",     text: "text-amber-700"   },
    emerald: { tile: "bg-emerald-100 text-emerald-700", text: "text-emerald-700" },
    sky:     { tile: "bg-sky-100 text-sky-700",         text: "text-sky-700"     },
    rose:    { tile: "bg-rose-100 text-rose-700",       text: "text-rose-700"    },
    slate:   { tile: "bg-slate-100 text-slate-700",     text: "text-slate-900"   },
  };
  const a = accents[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md ${
        span === 2 ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </div>
          <div className={`mt-2 text-3xl font-extrabold tracking-tight ${a.text}`}>
            {value}
          </div>
          {hint ? (
            <div className="mt-1 text-xs text-slate-500">{hint}</div>
          ) : null}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${a.tile}`}>
          {icon}
        </div>
      </div>
    </div>
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
function TrendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
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
function EnvelopeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
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
function InventoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
