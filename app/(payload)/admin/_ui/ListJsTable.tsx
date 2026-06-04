"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { deletePageAdmin, deleteProductAdmin, deleteTicketAdmin } from "../actions";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { Input } from "./Input";
import { Select } from "./Select";
import { cn } from "./classNames";

type BadgeTone = "primary" | "success" | "danger" | "warning" | "info" | "slate";

export type ListColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
};

export type ListRow = {
  id: string;
  cells: Record<string, string>;
  status?: {
    label: string;
    tone: BadgeTone;
  };
  flags?: Array<{
    label: string;
    tone: BadgeTone;
  }>;
};

type ListJsTableProps = {
  addHref?: string;
  addLabel?: string;
  columns: ListColumn[];
  /** Column key the table is sorted by on first render (defaults to the first column). */
  defaultSortKey?: string;
  defaultSortDir?: "asc" | "desc";
  deleteKind?: "ticket" | "product" | "page";
  editHrefBase?: string;
  editHrefPattern?: string;
  emptyDescription?: string;
  emptyTitle: string;
  rows: ListRow[];
  title: string;
};

const pageSizes = [10, 25, 50];

export function ListJsTable({
  addHref,
  addLabel = "Add",
  columns,
  defaultSortKey,
  defaultSortDir = "asc",
  deleteKind,
  editHrefBase,
  editHrefPattern,
  emptyDescription,
  emptyTitle,
  rows,
  title,
}: ListJsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState(defaultSortKey ?? columns[0]?.key ?? "");
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const statuses = useMemo(
    () => ["all", ...Array.from(new Set(rows.map((row) => row.status?.label).filter(Boolean)))],
    [rows]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows
      .filter((row) => {
        if (status !== "all" && row.status?.label !== status) return false;
        if (!q) return true;

        return Object.values(row.cells).some((value) => value.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        const av = a.cells[sortKey] ?? "";
        const bv = b.cells[sortKey] ?? "";
        const direction = sortDir === "asc" ? 1 : -1;

        return av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" }) * direction;
      });
  }, [query, rows, sortDir, sortKey, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const hasEdit = Boolean(editHrefBase || editHrefPattern);
  const visibleIds = paged.map((row) => row.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function toggleAllVisible() {
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    );
  }

  function toggleRow(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id]
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#e9ebec] bg-white shadow-sm">
      <div className="border-b border-[#e9ebec] px-5 py-4">
        <h4 className="mb-0 text-base font-semibold text-[#212529]">Add, Edit & Remove</h4>
      </div>
      <div className="p-5">
        <div className="listjs-table" aria-label={title}>
          <div className="mb-4 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex flex-wrap gap-2">
              {addHref ? (
                <Button href={addHref} className="bg-[#405189] text-white! hover:bg-[#364574]" icon={<PlusIcon />}>
                  {addLabel}
                </Button>
              ) : null}
              <Button
                type="button"
                color="danger"
                variant="soft"
                disabled={!selectedIds.length}
                title="Select rows first"
                icon={<TrashIcon />}
              >
                <span className="sr-only sm:not-sr-only">Bulk remove</span>
              </Button>
            </div>
            <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
              <Select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className="w-44"
              >
                {statuses.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All statuses" : option}
                  </option>
                ))}
              </Select>
              <div className="relative w-full sm:w-72">
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search..."
                  className="search h-10 rounded-md border-[#ced4da] pr-9"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#878a99]">
                  <SearchIcon />
                </span>
              </div>
            </div>
          </div>

          {rows.length ? (
            <div className="table-card mb-1 mt-3 overflow-x-auto border-y border-[#e9ebec]">
              <table className="w-full min-w-[980px] table-auto whitespace-nowrap align-middle text-sm">
                <thead className="table-light bg-[#f3f6f9] text-[#495057]">
              <tr>
                <th scope="col" className="w-[50px] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    className="h-4 w-4 rounded border-[#ced4da] accent-[#405189]"
                    aria-label="Select visible rows"
                  />
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "sort px-4 py-3 text-left text-xs font-semibold",
                      column.align === "right" && "text-right"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cn(
                        "inline-flex items-center gap-1 transition hover:text-[#405189]",
                        column.align === "right" && "ml-auto"
                      )}
                    >
                      {column.label}
                      <SortIcon active={sortKey === column.key} dir={sortDir} />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="list form-check-all divide-y divide-[#e9ebec]">
              {paged.map((row) => (
                <tr key={row.id} className="transition hover:bg-[#f3f6f9]">
                  <th scope="row" className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleRow(row.id)}
                      className="h-4 w-4 rounded border-[#ced4da] accent-[#405189]"
                      aria-label={`Select ${row.cells[columns[0]?.key] || row.id}`}
                    />
                  </th>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-4 py-3 text-[#212529]",
                        column.align === "right" && "text-right font-medium"
                      )}
                    >
                      {column.key === "status" && row.status ? (
                        <Badge tone={row.status.tone}>{row.status.label}</Badge>
                      ) : column.key === "flags" && row.flags?.length ? (
                        <span className="flex flex-wrap gap-1.5">
                          {row.flags.map((flag) => (
                            <Badge key={flag.label} tone={flag.tone}>
                              {flag.label}
                            </Badge>
                          ))}
                        </span>
                      ) : (
                        row.cells[column.key] || "-"
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {hasEdit ? (
                        <Link
                          href={
                            editHrefPattern
                              ? editHrefPattern.replace("{id}", encodeURIComponent(row.id))
                              : `${editHrefBase}/${row.id}`
                          }
                          className="inline-flex h-8 items-center rounded-md bg-[#0ab39c] px-3 text-xs font-semibold text-white transition hover:bg-[#099885]"
                        >
                          Edit
                        </Link>
                      ) : null}
                      {deleteKind ? <DeleteButton id={row.id} kind={deleteKind} /> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          ) : (
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              action={
                addHref ? (
                  <Button href={addHref} icon={<PlusIcon />}>
                    {addLabel}
                  </Button>
                ) : undefined
              }
            />
          )}

          {rows.length ? (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="flex items-center gap-2 text-sm text-[#878a99]">
            <span>Rows per page</span>
            <Select
              value={String(pageSize)}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="h-9 w-24"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              color="slate"
              variant="ghost"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage <= 1}
            >
              Previous
            </Button>
            <span className="rounded-md bg-[#405189] px-3 py-1.5 text-sm font-semibold text-white">
              {safePage} / {pageCount}
            </span>
            <Button
              color="slate"
              variant="ghost"
              size="sm"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={safePage >= pageCount}
            >
              Next
            </Button>
          </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DeleteButton({ id, kind }: { id: string; kind: "ticket" | "product" | "page" }) {
  const action =
    kind === "ticket" ? deleteTicketAdmin : kind === "product" ? deleteProductAdmin : deletePageAdmin;

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-8 items-center rounded-md bg-[#f06548] px-3 text-xs font-semibold text-white transition hover:bg-[#cc563d]"
      >
        Remove
      </button>
    </form>
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

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {active && dir === "asc" ? <path d="m7 14 5-5 5 5" /> : <path d="m7 10 5 5 5-5" />}
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}
