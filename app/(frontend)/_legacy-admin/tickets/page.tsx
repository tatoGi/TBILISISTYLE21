import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { listTickets } from "@/lib/tickets";
import { AdminShell } from "../_components/AdminShell";
import { DeleteTicketButton } from "../_components/TicketForm";

export const metadata: Metadata = {
  title: "Ticket Types | Admin",
};

export const dynamic = "force-dynamic";

const statusTone: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  active: "bg-emerald-100 text-emerald-700",
  sold_out: "bg-rose-100 text-rose-700",
};

const statusLabel: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  sold_out: "Sold out",
};

export default async function AdminTicketsPage() {
  if (!(await isAdminSession())) {
    redirect("/admin?error=session");
  }

  const tickets = await listTickets();

  return (
    <AdminShell
      title="Ticket Types"
      eyebrow="Catalog"
      actions={
        <Link
          href="/admin/tickets/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
        >
          <PlusIcon />
          Create ticket type
        </Link>
      }
    >
      <section className="grid gap-4">
        <header className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Ticket types{" "}
            <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {tickets.length}
            </span>
          </h2>
        </header>

        {tickets.length ? (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                      statusTone[ticket.status] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {statusLabel[ticket.status] ?? ticket.status}
                  </span>
                  <div>
                    <p className="text-base font-bold text-slate-900">
                      {ticket.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {ticket.priceGel} ₾ · {ticket.quantity} left ·{" "}
                      {ticket.eventDate || "no date"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/tickets/${ticket.id}/edit`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <PencilIcon />
                    Edit
                  </Link>
                  <DeleteTicketButton id={ticket.id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-slate-700">No ticket types yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Use the “Create ticket type” button to add the first one.
            </p>
          </div>
        )}
      </section>
    </AdminShell>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
