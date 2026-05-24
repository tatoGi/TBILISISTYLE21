import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { listTickets } from "@/lib/tickets";
import { AdminShell } from "../_components/AdminShell";
import { DeleteTicketButton, TicketForm } from "../_components/TicketForm";

export const metadata: Metadata = {
  title: "Ticket Types | Admin",
};

export default async function AdminTicketsPage() {
  if (!(await isAdminSession())) {
    redirect("/admin?error=session");
  }

  const tickets = await listTickets();

  return (
    <AdminShell title="Ticket Types">
      <section className="grid gap-3">
        <h2 className="text-xl font-black uppercase">New Ticket Type</h2>
        <TicketForm />
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-black uppercase">Existing Ticket Types</h2>
        {tickets.length ? (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="grid gap-4 border border-white/10 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black uppercase">{ticket.title}</p>
                    <p className="text-sm text-white/55">
                      {ticket.status} - {ticket.priceGel} GEL - {ticket.quantity} left
                    </p>
                  </div>
                  <DeleteTicketButton id={ticket.id} />
                </div>
                <TicketForm ticket={ticket} />
              </div>
            ))}
          </div>
        ) : (
          <p className="border border-white/10 p-5 text-white/60">
            No ticket types have been added yet.
          </p>
        )}
      </section>
    </AdminShell>
  );
}
