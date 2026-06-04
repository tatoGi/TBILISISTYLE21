import type { AdminViewServerProps } from "payload";
import { listProductOrders } from "@/lib/product-orders";
import { listSoldTickets } from "@/lib/sold-tickets";
import { AdminShell, Card, CardBody, PageHeader } from "./_ui";
import { ActivityTable, type ActivityRow } from "./ActivityTable";

export const dynamic = "force-dynamic";

function toTime(value: unknown): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function loadActivity(): Promise<ActivityRow[]> {
  const [tickets, orders] = await Promise.all([
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

export default async function ActivityView(props: AdminViewServerProps) {
  const rows = await loadActivity();
  const revenue = rows.reduce((sum, r) => sum + (r.amount || 0), 0);
  const tickets = rows.filter((r) => r.kind === "ticket").length;
  const merch = rows.filter((r) => r.kind === "merch").length;

  return (
    <AdminShell {...props} breadcrumb={[{ label: "Activity" }]}>
      <div className="ts21-admin-view">
        <div className="mx-auto grid max-w-7xl gap-7">
          <PageHeader
            eyebrow="Transactions"
            title="Activity"
            description="Every completed ticket and merch purchase, newest first."
          />

          <section className="grid gap-4 sm:grid-cols-3">
            <Summary label="Total revenue" value={`${revenue.toLocaleString("en-US")} GEL`} />
            <Summary label="Tickets" value={String(tickets)} />
            <Summary label="Merch orders" value={String(merch)} />
          </section>

          <ActivityTable rows={rows} />
        </div>
      </div>
    </AdminShell>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardBody>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
      </CardBody>
    </Card>
  );
}
