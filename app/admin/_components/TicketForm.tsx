import type { Ticket } from "@/lib/tickets";
import { createTicket, deleteTicket, updateTicket } from "../actions";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-white/80">
      {label}
      <input
        className="h-11 border border-white/15 bg-white/10 px-3 text-white outline-none transition focus:border-yellow-300"
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
      />
    </label>
  );
}

export function TicketForm({ ticket }: { ticket?: Ticket }) {
  const action = ticket ? updateTicket : createTicket;

  return (
    <form action={action} className="grid gap-4 border border-white/10 p-5">
      {ticket ? <input type="hidden" name="id" value={ticket.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" name="title" defaultValue={ticket?.title} required />
        <Field
          label="Price GEL"
          name="priceGel"
          type="number"
          defaultValue={ticket?.priceGel ?? 0}
          required
        />
        <Field
          label="Event Date"
          name="eventDate"
          type="date"
          defaultValue={ticket?.eventDate}
        />
        <Field
          label="Quantity"
          name="quantity"
          type="number"
          defaultValue={ticket?.quantity ?? 0}
        />
        <Field label="Location" name="location" defaultValue={ticket?.location} />
        <Field
          label="Sale URL"
          name="saleUrl"
          type="url"
          defaultValue={ticket?.saleUrl}
        />
      </div>

      <label className="grid gap-2 text-sm font-semibold text-white/80">
        Status
        <select
          className="h-11 border border-white/15 bg-black px-3 text-white outline-none transition focus:border-yellow-300"
          name="status"
          defaultValue={ticket?.status || "draft"}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="sold_out">Sold out</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-semibold text-white/80">
        Description
        <textarea
          className="min-h-28 resize-y border border-white/15 bg-white/10 p-3 text-white outline-none transition focus:border-yellow-300"
          name="description"
          defaultValue={ticket?.description}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button className="h-11 bg-yellow-300 px-5 text-sm font-black uppercase text-black transition hover:bg-white">
          {ticket ? "Save" : "Add Ticket"}
        </button>
      </div>
    </form>
  );
}

export function DeleteTicketButton({ id }: { id: string }) {
  return (
    <form action={deleteTicket}>
      <input type="hidden" name="id" value={id} />
      <button className="border border-red-400/40 px-4 py-2 text-xs font-bold uppercase text-red-100 transition hover:bg-red-500/20">
        Delete
      </button>
    </form>
  );
}
