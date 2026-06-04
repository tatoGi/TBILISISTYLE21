import type { AdminViewServerProps } from "payload";
import { listSoldTickets } from "@/lib/sold-tickets";
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

function statusFor(value: string): NonNullable<ListRow["status"]> {
  if (value === "paid") return { label: "Paid", tone: "success" };
  if (value === "scanned") return { label: "Scanned", tone: "info" };
  if (value === "failed") return { label: "Failed", tone: "danger" };
  if (value === "pending") return { label: "Pending", tone: "warning" };
  return { label: value || "Unknown", tone: "slate" };
}

export default async function SoldTicketsListView(props: AdminViewServerProps) {
  const tickets = await listSoldTickets();
  const rows: ListRow[] = tickets.map((ticket) => {
    const status = ticket.scannedAt ? statusFor("scanned") : statusFor(ticket.status);

    return {
      id: ticket.id,
      cells: {
        amount: `${ticket.amount.toLocaleString("en-US")} GEL`,
        buyer: `${ticket.name ?? ""} ${ticket.surname ?? ""}`.trim() || "-",
        email: ticket.email || "-",
        event: ticket.eventName || "-",
        paidAt: formatDate(ticket.paidAt ?? ticket.createdAt),
        status: status.label,
      },
      status,
    };
  });

  return (
    <AdminShell {...props} breadcrumb={[{ label: "Sold Tickets" }]}>
      <div className="ts21-admin-view">
      <PageHeader
        eyebrow="Orders"
        title="Sold Tickets"
        description="Operational ticket sales list with List.js style filtering and sorting."
      />
      <ListJsTable
        columns={columns}
        editHrefBase="/admin/collections/soldTickets"
        emptyTitle="No sold tickets yet"
        rows={rows}
        title="Sold tickets"
      />
      </div>
    </AdminShell>
  );
}
