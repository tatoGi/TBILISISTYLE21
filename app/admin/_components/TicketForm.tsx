import type { Ticket } from "@/lib/tickets";
import { createTicket, deleteTicket, updateTicket } from "../actions";

type Status = Ticket["status"];

const statuses: { value: Status; label: string; tone: string }[] = [
  { value: "draft",    label: "Draft",     tone: "bg-slate-100 text-slate-700"   },
  { value: "active",   label: "Active",    tone: "bg-emerald-100 text-emerald-700" },
  { value: "sold_out", label: "Sold out",  tone: "bg-rose-100 text-rose-700"     },
];

export function TicketForm({ ticket }: { ticket?: Ticket }) {
  const action = ticket ? updateTicket : createTicket;
  const isEdit = !!ticket;

  return (
    <form
      action={action}
      className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {isEdit ? <input type="hidden" name="id" value={ticket.id} /> : null}

      <div className="grid gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          {isEdit ? "Edit ticket" : "Basic details"}
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Title"
          name="title"
          defaultValue={ticket?.title}
          placeholder="e.g. Day 1 Pass"
          required
        />
        <Field
          label="Price (GEL)"
          name="priceGel"
          type="number"
          step="0.01"
          min="0"
          defaultValue={ticket?.priceGel ?? 0}
          required
        />
        <Field
          label="Event date"
          name="eventDate"
          type="date"
          defaultValue={ticket?.eventDate}
        />
        <Field
          label="Quantity"
          name="quantity"
          type="number"
          min="0"
          defaultValue={ticket?.quantity ?? 0}
        />
        <Field
          label="Location"
          name="location"
          defaultValue={ticket?.location}
          placeholder="e.g. Tbilisi"
        />
        <Field
          label="Sale URL"
          name="saleUrl"
          type="url"
          defaultValue={ticket?.saleUrl}
          placeholder="https://"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <label
              key={s.value}
              className="cursor-pointer"
            >
              <input
                type="radio"
                name="status"
                value={s.value}
                defaultChecked={(ticket?.status ?? "draft") === s.value}
                className="peer sr-only"
              />
              <span
                className={`inline-flex items-center rounded-full border-2 border-transparent px-3 py-1.5 text-xs font-semibold ${s.tone} peer-checked:border-current peer-checked:shadow-sm`}
              >
                {s.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={ticket?.description}
          rows={4}
          placeholder="What's included with this ticket?"
          className="w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
        >
          {isEdit ? (
            <>
              <PencilIcon />
              Save changes
            </>
          ) : (
            <>
              <PlusIcon />
              Add ticket type
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  placeholder,
  step,
  min,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
  min?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </span>
      <input
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        name={name}
        type={type}
        step={step}
        min={min}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}

export function DeleteTicketButton({ id }: { id: string }) {
  return (
    <form action={deleteTicket}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 text-xs font-bold text-rose-600 shadow-sm transition hover:border-rose-400 hover:bg-rose-50"
      >
        <TrashIcon />
        Delete
      </button>
    </form>
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
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
