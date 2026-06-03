import { listSoldTickets } from "@/lib/sold-tickets";
import { listProductOrders } from "@/lib/product-orders";
import { ActivityTable, type ActivityRow } from "./ActivityTable";

export const dynamic = "force-dynamic";

function toTime(value: unknown): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function loadActivity(): Promise<ActivityRow[]> {
  const [tickets, orders] = await Promise.all([
    // Real buyers only (paid / scanned), skip never-completed attempts.
    listSoldTickets({ status: { in: ["paid", "scanned"] } }),
    listProductOrders({ status: { in: ["paid", "collected"] } }),
  ]);

  const ticketRows: ActivityRow[] = tickets.map((t) => ({
    id: t.id,
    kind: "ticket",
    who: `${t.name ?? ""} ${t.surname ?? ""}`.trim(),
    item: t.eventName || "Ticket",
    amount: Number(t.amount ?? 0),
    method: "Card (Quipu)",
    status: t.scannedAt ? "scanned" : t.status,
    at: toTime(t.paidAt) ?? toTime(t.createdAt),
  }));

  const merchRows: ActivityRow[] = orders.map((o) => ({
    id: o.id,
    kind: "merch",
    who: o.name || "",
    item: `${o.productTitle}${o.size ? ` (${o.size})` : ""}`,
    amount: Number(o.amount ?? 0),
    method: "Card (Quipu)",
    status: o.status,
    at: toTime(o.paidAt) ?? toTime(o.createdAt),
  }));

  return [...ticketRows, ...merchRows].sort((a, b) => {
    const ta = a.at ? Date.parse(a.at) : 0;
    const tb = b.at ? Date.parse(b.at) : 0;
    return tb - ta;
  });
}

export default async function ActivityView() {
  const rows = await loadActivity();
  const revenue = rows.reduce((sum, r) => sum + (r.amount || 0), 0);
  const tickets = rows.filter((r) => r.kind === "ticket").length;
  const merch = rows.filter((r) => r.kind === "merch").length;

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-7 text-slate-900 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-7">
        <header>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600">
            Transactions
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
            Activity — who bought what
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Every completed ticket and merch purchase, newest first.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <Summary label="Total revenue" value={`${revenue.toLocaleString("en-US")} ₾`} />
          <Summary label="Tickets" value={String(tickets)} />
          <Summary label="Merch orders" value={String(merch)} />
        </section>

        <ActivityTable rows={rows} />
      </div>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}
