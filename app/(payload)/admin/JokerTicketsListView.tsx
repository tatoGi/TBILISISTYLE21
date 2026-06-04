import type { AdminViewServerProps } from "payload";
import { listJokerTickets } from "@/lib/sold-tickets";
import { AdminShell, ListJsTable, PageHeader, type ListColumn, type ListRow } from "./_ui";

export const dynamic = "force-dynamic";

const columns: ListColumn[] = [
  { key: "buyer", label: "Buyer" },
  { key: "email", label: "Email" },
  { key: "event", label: "Event" },
  { key: "paidAt", label: "Paid at" },
  { key: "amount", label: "Amount", align: "right" },
  { key: "status", label: "Status" },
];

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("en-GB");
}

export default async function JokerTicketsListView(props: AdminViewServerProps) {
  const tickets = await listJokerTickets();
  const rows: ListRow[] = tickets.map((ticket) => ({
    id: ticket.id,
    cells: {
      amount: `${ticket.amount.toLocaleString("en-US")} GEL`,
      buyer: `${ticket.name ?? ""} ${ticket.surname ?? ""}`.trim() || "-",
      email: ticket.email || "-",
      event: ticket.eventName || "Joker Ticket",
      paidAt: formatDate(ticket.paidAt ?? ticket.createdAt),
      status: ticket.scannedAt ? "Scanned" : "Paid",
    },
    status: ticket.scannedAt ? { label: "Scanned", tone: "info" } : { label: "Paid", tone: "success" },
  }));

  return (
    <AdminShell {...props} breadcrumb={[{ label: "Joker Tickets" }]}>
      <div className="ts21-admin-view">
      <PageHeader
        eyebrow="Orders"
        title="Joker Tickets"
        description="Paid joker ticket purchases, newest first."
      />
      <ListJsTable
        columns={columns}
        editHrefBase="/admin/collections/soldTickets"
        emptyTitle="No joker tickets yet"
        rows={rows}
        title="Joker tickets"
      />
      </div>
    </AdminShell>
  );
}
