import type { AdminViewServerProps } from "payload";
import { getPayloadClient } from "@/lib/payload";
import { AdminShell, ListJsTable, PageHeader, type ListColumn, type ListRow } from "./_ui";

export const dynamic = "force-dynamic";

const columns: ListColumn[] = [
  { key: "email", label: "Email" },
  { key: "subject", label: "Subject" },
  { key: "type", label: "Type" },
  { key: "attempts", label: "Attempts", align: "right" },
  { key: "createdAt", label: "Created" },
  { key: "status", label: "Status" },
];

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("en-GB");
}

function statusFor(value: string): NonNullable<ListRow["status"]> {
  if (value === "sent") return { label: "Sent", tone: "success" };
  if (value === "processing") return { label: "Processing", tone: "info" };
  if (value === "failed") return { label: "Failed", tone: "danger" };
  if (value === "pending") return { label: "Pending", tone: "warning" };
  return { label: value || "Unknown", tone: "slate" };
}

export default async function EmailJobsListView(props: AdminViewServerProps) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "messageJobs",
    depth: 0,
    limit: 0,
    pagination: false,
    sort: "-createdAt",
  });
  const rows: ListRow[] = result.docs.map((doc) => {
    const record = doc as unknown as Record<string, unknown>;
    const status = statusFor(String(record.status ?? ""));

    return {
      id: String(record.id),
      cells: {
        attempts: String(record.attempts ?? 0),
        createdAt: formatDate(record.createdAt),
        email: String(record.email ?? "-"),
        status: status.label,
        subject: String(record.subject ?? "-"),
        type: String(record.type ?? "-"),
      },
      status,
    };
  });

  return (
    <AdminShell {...props} breadcrumb={[{ label: "Email Queue" }]}>
      <div className="ts21-admin-view">
      <PageHeader
        eyebrow="Messages"
        title="Email Queue"
        description="Outgoing ticket email queue with List.js style filtering and sorting."
      />
      <ListJsTable
        columns={columns}
        editHrefBase="/admin/collections/messageJobs"
        emptyTitle="No email jobs yet"
        rows={rows}
        title="Email queue"
      />
      </div>
    </AdminShell>
  );
}
