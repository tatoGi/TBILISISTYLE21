import type { AdminViewServerProps } from "payload";
import { listTickets } from "@/lib/tickets";
import { AdminShell, ListJsTable, PageHeader, type ListColumn, type ListRow } from "./_ui";

export const dynamic = "force-dynamic";

const columns: ListColumn[] = [
  { key: "title", label: "Ticket" },
  { key: "eventDate", label: "Event date" },
  { key: "price", label: "Price", align: "right" },
  { key: "quantity", label: "Qty", align: "right" },
  { key: "status", label: "Status" },
];

const statusTone: Record<string, ListRow["status"]> = {
  draft: { label: "Draft", tone: "slate" },
  active: { label: "Active", tone: "success" },
  sold_out: { label: "Sold out", tone: "danger" },
};

export default async function TicketsListView(props: AdminViewServerProps) {
  const tickets = await listTickets();
  const rows: ListRow[] = tickets.map((ticket) => ({
    id: ticket.id,
    cells: {
      eventDate: ticket.eventDate || "-",
      price: `${ticket.priceGel.toLocaleString("en-US")} GEL`,
      quantity: String(ticket.quantity),
      status: statusTone[ticket.status]?.label ?? ticket.status,
      title: ticket.title,
    },
    status: statusTone[ticket.status] ?? { label: ticket.status, tone: "slate" },
  }));

  return (
    <AdminShell {...props} breadcrumb={[{ label: "Ticket Types" }]}>
      <div className="ts21-admin-view">
      <PageHeader
        eyebrow="Catalog"
        title="Ticket Types"
        description="List.js style add, edit and remove controls for ticket catalog CRUD."
      />
      <ListJsTable
        addHref="/admin/collections/tickets/create"
        addLabel="Add ticket"
        columns={columns}
        deleteKind="ticket"
        editHrefBase="/admin/collections/tickets"
        emptyDescription="Add the first ticket type to start selling festival passes."
        emptyTitle="No ticket types yet"
        rows={rows}
        title="Ticket types"
      />
      </div>
    </AdminShell>
  );
}
