import type { AdminViewServerProps } from "payload";
import { getPayloadClient } from "@/lib/payload";
import { AdminShell, ListJsTable, PageHeader, type ListColumn, type ListRow } from "./_ui";

export const dynamic = "force-dynamic";

const columns: ListColumn[] = [
  { key: "email", label: "Email" },
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
  { key: "updatedAt", label: "Updated" },
];

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function formatDate(value: unknown) {
  if (typeof value !== "string") return "-";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function UsersListView(props: AdminViewServerProps) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "users",
    depth: 0,
    limit: 0,
    pagination: false,
    sort: "email",
  });

  const rows: ListRow[] = result.docs.map((user) => {
    const record = user as unknown as Record<string, unknown>;

    return {
      id: String(record.id),
      cells: {
        email: asText(record.email),
        name: asText(record.name),
        status: "Admin",
        updatedAt: formatDate(record.updatedAt),
      },
      status: { label: "Admin", tone: "primary" },
    };
  });

  return (
    <AdminShell {...props} breadcrumb={[{ label: "Users" }]}>
      <div className="ts21-admin-view">
      <PageHeader eyebrow="System" title="Users" description="Admin accounts in the same operations panel." />
      <ListJsTable
        addHref="/admin/collections/users/create"
        addLabel="Add user"
        columns={columns}
        editHrefBase="/admin/collections/users"
        emptyDescription="Create an admin user for Payload access."
        emptyTitle="No users yet"
        rows={rows}
        title="Users"
      />
      </div>
    </AdminShell>
  );
}
