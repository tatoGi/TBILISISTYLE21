import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";
import { AdminShell } from "../_components/AdminShell";
import {
  deleteEmailJob,
  processEmailQueue,
  retryAllFailedEmails,
  retryEmailJob,
} from "../actions";

export const metadata: Metadata = {
  title: "Email Queue | Admin",
};

export const dynamic = "force-dynamic";

type JobStatus = "pending" | "processing" | "sent" | "failed";

type JobRow = {
  id: string;
  status: JobStatus;
  attempts: number;
  ticketId: string;
  email: string;
  name: string;
  surname: string;
  eventName?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  sentAt?: Date | string;
  lastError?: string | null;
};

const statusMeta: Record<JobStatus, { label: string; tone: string; dot: string }> = {
  pending:    { label: "Pending",    tone: "bg-amber-100 text-amber-700",       dot: "bg-amber-500" },
  processing: { label: "Processing", tone: "bg-sky-100 text-sky-700",           dot: "bg-sky-500" },
  sent:       { label: "Sent",       tone: "bg-emerald-100 text-emerald-700",   dot: "bg-emerald-500" },
  failed:     { label: "Failed",     tone: "bg-rose-100 text-rose-700",         dot: "bg-rose-500" },
};

async function loadJobs(): Promise<{
  jobs: JobRow[];
  counts: Record<JobStatus, number>;
  totalSent24h: number;
}> {
  const payload = await getPayloadClient();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const countByStatus = (status: JobStatus) =>
    payload
      .count({ collection: "messageJobs", where: { status: { equals: status } } })
      .then((r) => r.totalDocs);

  const [rows, pending, processing, sent, failed, totalSent24h] = await Promise.all([
    payload.find({
      collection: "messageJobs",
      sort: ["-updatedAt", "-createdAt"],
      limit: 100,
      depth: 0,
    }),
    countByStatus("pending"),
    countByStatus("processing"),
    countByStatus("sent"),
    countByStatus("failed"),
    payload
      .count({
        collection: "messageJobs",
        where: {
          and: [{ status: { equals: "sent" } }, { sentAt: { greater_than_equal: yesterday } }],
        },
      })
      .then((r) => r.totalDocs),
  ]);

  const counts: Record<JobStatus, number> = { pending, processing, sent, failed };

  const jobs: JobRow[] = rows.docs.map((doc) => {
    const r = doc as unknown as Record<string, unknown>;
    const p = (r.payload ?? {}) as Record<string, unknown>;
    return {
      id: String(r.id),
      status: r.status as JobStatus,
      attempts: (r.attempts as number) ?? 0,
      ticketId: (p.ticketId as string) ?? "",
      email: (p.email as string) ?? "",
      name: (p.name as string) ?? "",
      surname: (p.surname as string) ?? "",
      eventName: p.eventName as string | undefined,
      createdAt: r.createdAt as string | undefined,
      updatedAt: r.updatedAt as string | undefined,
      sentAt: r.sentAt as string | undefined,
      lastError: r.lastError as string | null | undefined,
    };
  });

  return { jobs, counts, totalSent24h };
}

function formatTime(value?: Date | string) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminEmailsPage() {
  if (!(await isAdminSession())) {
    redirect("/admin?error=session");
  }

  const { jobs, counts, totalSent24h } = await loadJobs();
  const total = jobs.length;

  return (
    <AdminShell
      title="Email Queue"
      eyebrow="Notifications"
      actions={
        <>
          <form action={processEmailQueue}>
            <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
              <RefreshIcon />
              Process queue
            </button>
          </form>
          {counts.failed > 0 ? (
            <form action={retryAllFailedEmails}>
              <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700">
                <RetryIcon />
                Retry all failed ({counts.failed})
              </button>
            </form>
          ) : null}
        </>
      }
    >
      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Sent" value={counts.sent} tone="emerald" sub={`${totalSent24h} in last 24h`} />
        <Stat label="Pending" value={counts.pending + counts.processing} tone="amber" sub="awaiting delivery" />
        <Stat label="Failed" value={counts.failed} tone="rose" sub="needs attention" />
        <Stat
          label="Success rate"
          value={
            counts.sent + counts.failed > 0
              ? `${Math.round((counts.sent / (counts.sent + counts.failed)) * 100)}%`
              : "—"
          }
          tone="slate"
          sub={`of ${counts.sent + counts.failed} attempts`}
        />
      </section>

      {/* Table */}
      <section className="grid gap-3">
        <header className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Recent jobs{" "}
            <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {total}
            </span>
          </h2>
          <p className="text-xs text-slate-500">Showing latest 100</p>
        </header>

        {total === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-slate-700">No email jobs yet</p>
            <p className="mt-1 text-sm text-slate-500">
              When tickets are purchased, the ticket delivery emails will show up here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold">Ticket</th>
                    <th className="px-4 py-3 font-bold">Recipient</th>
                    <th className="px-4 py-3 font-bold">Attempts</th>
                    <th className="px-4 py-3 font-bold">Last update</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const meta = statusMeta[job.status];
                    return (
                      <tr key={job.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${meta.tone}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs font-bold text-slate-900">
                            {job.ticketId || "—"}
                          </div>
                          {job.eventName ? (
                            <div className="text-xs text-slate-500">{job.eventName}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {job.name} {job.surname}
                          </div>
                          <div className="text-xs text-slate-500 break-all">{job.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-bold ${
                              job.attempts >= 5
                                ? "bg-rose-100 text-rose-700"
                                : job.attempts > 0
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {job.attempts} / 5
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {job.status === "sent"
                            ? `Sent ${formatTime(job.sentAt)}`
                            : formatTime(job.updatedAt ?? job.createdAt)}
                          {job.lastError ? (
                            <details className="mt-1">
                              <summary className="cursor-pointer text-xs font-semibold text-rose-600 hover:underline">
                                Error details
                              </summary>
                              <pre className="mt-1 max-w-xs whitespace-pre-wrap rounded-md bg-rose-50 p-2 text-[11px] text-rose-900">
                                {job.lastError}
                              </pre>
                            </details>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
                            {job.status !== "sent" ? (
                              <form action={retryEmailJob}>
                                <input type="hidden" name="jobId" value={job.id} />
                                <button
                                  type="submit"
                                  title="Retry now"
                                  className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
                                >
                                  <RetryIcon />
                                  Retry
                                </button>
                              </form>
                            ) : null}
                            <form action={deleteEmailJob}>
                              <input type="hidden" name="jobId" value={job.id} />
                              <button
                                type="submit"
                                title="Remove job"
                                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                              >
                                <TrashIcon />
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </AdminShell>
  );
}

type Tone = "emerald" | "amber" | "rose" | "slate";

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number | string;
  sub?: string;
  tone: Tone;
}) {
  const tones: Record<Tone, { v: string; chip: string }> = {
    emerald: { v: "text-emerald-700", chip: "bg-emerald-100 text-emerald-700" },
    amber:   { v: "text-amber-700",   chip: "bg-amber-100 text-amber-700"   },
    rose:    { v: "text-rose-700",    chip: "bg-rose-100 text-rose-700"     },
    slate:   { v: "text-slate-900",   chip: "bg-slate-100 text-slate-700"   },
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className={`mt-2 text-3xl font-extrabold tracking-tight ${tones[tone].v}`}>
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-slate-500">{sub}</div> : null}
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function RetryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <polyline points="21 3 21 9 15 9" />
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
