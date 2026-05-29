import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { listTickets } from "@/lib/tickets";
import { AdminShell } from "../_components/AdminShell";
import { DeleteTicketButton, TicketForm } from "../_components/TicketForm";

export const metadata: Metadata = {
  title: "Ticket Types | Admin",
};

export const dynamic = "force-dynamic";

const statusTone: Record<string, string> = {
  draft:    "bg-slate-100 text-slate-700",
  active:   "bg-emerald-100 text-emerald-700",
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
    <AdminShell title="Ticket Types" eyebrow="Catalog">
      <section className="grid gap-3">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add a new ticket type</h2>
            <p className="text-sm text-slate-500">
              New ticket types appear on the public tickets page once their status is set to Active.
            </p>
          </div>
        </header>
        <TicketForm />
      </section>

      <section className="grid gap-4">
        <header className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Existing ticket types{" "}
            <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {tickets.length}
            </span>
          </h2>
        </header>

        {tickets.length ? (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <details
                key={ticket.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-5 hover:bg-slate-50">
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
                        {ticket.priceGel} ₾ · {ticket.quantity} left · {ticket.eventDate || "no date"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 group-open:hidden">
                      <PencilIcon />
                      Edit
                    </span>
                    <span className="hidden h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 group-open:inline-flex">
                      Close
                    </span>
                    <DeleteTicketButton id={ticket.id} />
                  </div>
                </summary>
                <div className="border-t border-slate-100 bg-slate-50 p-5">
                  <TicketForm ticket={ticket} />
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-slate-700">No ticket types yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Use the form above to add the first ticket type.
            </p>
          </div>
        )}
      </section>
    </AdminShell>
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
