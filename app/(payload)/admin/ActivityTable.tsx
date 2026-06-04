"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState, Input, Scrollable, Select } from "./_ui";

export type ActivityRow = {
  id: string;
  kind: "ticket" | "merch";
  who: string;
  item: string;
  amount: number;
  method: string;
  status: string;
  at: string | null;
};

const statusTone: Record<string, "success" | "info" | "warning" | "danger" | "slate"> = {
  paid: "success",
  collected: "info",
  scanned: "info",
  pending: "warning",
  failed: "danger",
};

function formatWhen(value: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityTable({ rows }: { rows: ActivityRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const statuses = useMemo(() => ["all", ...Array.from(new Set(rows.map((r) => r.status)))], [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;

      return (
        r.who.toLowerCase().includes(q) ||
        r.item.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    });
  }, [rows, query, status]);

  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </span>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search buyer, item or id..."
              className="pl-9"
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s}
              </option>
            ))}
          </Select>
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((s) => (
              <Button
                key={s}
                onClick={() => setStatus(s)}
                size="sm"
                color={status === s ? "primary" : "slate"}
                variant={status === s ? "solid" : "soft"}
              >
                {s}
              </Button>
            ))}
          </div>
          <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-slate-400">
            {filtered.length} of {rows.length}
          </span>
        </div>
      </Card>

      {filtered.length ? (
        <Scrollable className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={`${r.kind}-${r.id}`} className="transition hover:bg-[#f3f6f9]">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatWhen(r.at)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{r.who || "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{r.item || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge tone="slate" className="rounded-md">
                      {r.kind}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{r.method}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{r.amount} GEL</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[r.status] ?? "slate"}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scrollable>
      ) : (
        <EmptyState
          title="No matching activity"
          description="Try a different search or status filter."
          action={
            <Button
              color="slate"
              variant="outline"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
