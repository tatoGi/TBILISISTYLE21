"use client";

import { useMemo, useState } from "react";
import type { SoldTicket } from "@/lib/sold-tickets";

type StatusFilter = "all" | "paid" | "scanned" | "unscanned";

const statusTone: Record<string, string> = {
  paid:    "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed:  "bg-rose-100 text-rose-700",
};

function formatDate(value?: string | Date) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SoldTicketsTable({ tickets }: { tickets: SoldTicket[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (filter === "scanned" && !t.scannedAt) return false;
      if (filter === "unscanned" && t.scannedAt) return false;
      if (filter === "paid" && t.status !== "paid") return false;
      if (!q) return true;
      const hay = [
        t.id,
        t.name,
        t.surname,
        t.personalNumber,
        t.email,
        t.eventName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [tickets, query, filter]);

  const totalRevenue = useMemo(
    () =>
      filtered.reduce(
        (sum, t) => (t.status === "paid" ? sum + Number(t.amount || 0) : sum),
        0,
      ),
    [filtered],
  );

  const scannedCount = useMemo(
    () => filtered.filter((t) => t.scannedAt).length,
    [filtered],
  );

  if (!tickets.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-slate-700">
          No purchased tickets yet
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Once payments start coming in they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-1 items-center gap-2 min-w-[260px]">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search by name, ID, email, ticket #…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {(
            [
              { v: "all", l: "All" },
              { v: "paid", l: "Paid" },
              { v: "scanned", l: "Scanned" },
              { v: "unscanned", l: "Not scanned" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.v}
              onClick={() => setFilter(opt.v as StatusFilter)}
              className={`h-8 rounded-md px-3 text-xs font-bold transition ${
                filter === opt.v
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3 text-sm">
        <Chip label="Showing" value={`${filtered.length} of ${tickets.length}`} />
        <Chip label="Revenue (filtered)" value={`${totalRevenue.toLocaleString("en-US")} ₾`} tone="amber" />
        <Chip label="Scanned" value={`${scannedCount}`} tone="sky" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Ticket</th>
                <th className="px-4 py-3 font-bold">Buyer</th>
                <th className="px-4 py-3 font-bold">Personal #</th>
                <th className="px-4 py-3 font-bold">Event</th>
                <th className="px-4 py-3 font-bold text-right">Amount</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Paid at</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => (
                <tr key={ticket.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-bold text-slate-900">
                      {ticket.id}
                    </div>
                    {ticket.scannedAt ? (
                      <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600">
                        <CheckIcon /> Scanned
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">
                      {ticket.name} {ticket.surname}
                    </div>
                    <div className="text-xs text-slate-500 break-all">{ticket.email}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">
                    {ticket.personalNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{ticket.eventName}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    {ticket.amount} ₾
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                        statusTone[ticket.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {formatDate(ticket.paidAt)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No tickets match your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Chip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "amber" | "sky";
}) {
  const tones = {
    default: "border-slate-200 bg-white text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    sky: "border-sky-200 bg-sky-50 text-sky-800",
  };
  const cls = tone ? tones[tone] : tones.default;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${cls}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
        {label}
      </span>
      <span className="text-xs font-bold">{value}</span>
    </span>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-slate-400"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
