import type { SoldTicket } from "@/lib/sold-tickets";

function formatDate(value?: string | Date) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString("en-US");
}

export function SoldTicketsTable({ tickets }: { tickets: SoldTicket[] }) {
  if (!tickets.length) {
    return (
      <p className="border border-white/10 p-5 text-white/60">
        No purchased tickets found yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-white/10">
      <table className="w-full min-w-[900px] border-collapse text-left text-sm">
        <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.14em] text-white/55">
          <tr>
            <th className="px-4 py-3">Ticket ID</th>
            <th className="px-4 py-3">Buyer</th>
            <th className="px-4 py-3">Personal Number</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Event</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Paid At</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-t border-white/10">
              <td className="px-4 py-3 font-bold text-yellow-300">{ticket.id}</td>
              <td className="px-4 py-3">
                {ticket.name} {ticket.surname}
              </td>
              <td className="px-4 py-3">{ticket.personalNumber}</td>
              <td className="px-4 py-3">{ticket.email}</td>
              <td className="px-4 py-3">{ticket.eventName}</td>
              <td className="px-4 py-3">{ticket.amount} GEL</td>
              <td className="px-4 py-3 uppercase">{ticket.status}</td>
              <td className="px-4 py-3">{formatDate(ticket.paidAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
