import Link from "next/link";
import { listTickets } from "@/lib/tickets";

export const dynamic = "force-dynamic";


export default async function TicketsPage() {
  const tickets = await listTickets({ publicOnly: true });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 pb-16 pt-28 text-white md:px-10">
      <div className="grid gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
          Tbilisi Style 21
        </p>
        <h1 className="text-4xl font-black uppercase md:text-6xl">Tickets</h1>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {tickets.length ? (
          tickets.map((ticket) => (
            <article
              key={ticket.id}
              className="grid gap-5 border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black uppercase">
                    {ticket.title}
                  </h2>
                  <p className="mt-2 text-sm text-white/55">
                    {ticket.eventDate || "Date TBA"} ·{" "}
                    {ticket.location || "Location TBA"}
                  </p>
                </div>
                <span className="shrink-0 bg-yellow-300 px-3 py-2 text-sm font-black text-black">
                  {ticket.priceGel} GEL
                </span>
              </div>

              {ticket.description ? (
                <p className="whitespace-pre-line text-sm leading-6 text-white/75">
                  {ticket.description}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <p className="text-sm font-bold uppercase text-white/55">
                  {ticket.status === "sold_out"
                    ? "Sold out"
                    : `${ticket.quantity} available`}
                </p>
                {ticket.status !== "sold_out" && ticket.quantity > 0 ? (
                  <Link
                    href={ticket.saleUrl || "#"}
                    className="bg-yellow-300 px-5 py-3 text-xs font-black uppercase text-black transition hover:bg-white"
                  >
                    Buy Ticket
                  </Link>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <p className="border border-white/10 p-5 text-white/60">
            Tickets are not available yet.
          </p>
        )}
      </div>
    </main>
  );
}
