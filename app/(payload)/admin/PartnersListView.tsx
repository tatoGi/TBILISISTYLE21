import type { AdminViewServerProps } from "payload";
import { getPayloadClient } from "@/lib/payload";
import { AdminShell, ListJsTable, PageHeader, type ListColumn, type ListRow } from "./_ui";

export const dynamic = "force-dynamic";

const columns: ListColumn[] = [
  { key: "name", label: "Partner" },
  { key: "website", label: "Website" },
  { key: "order", label: "Order" },
  { key: "featured", label: "Featured" },
  { key: "updatedAt", label: "Updated" },
];

function asText(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function formatDate(value: unknown) {
  if (typeof value !== "string") return "-";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function PartnersListView(props: AdminViewServerProps) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "partners",
    depth: 0,
    limit: 0,
    pagination: false,
    sort: "order",
  });

  const rows: ListRow[] = result.docs.map((partner) => {
    const record = partner as unknown as Record<string, unknown>;
    const featured = Boolean(record.featuredOnHome);

    return {
      id: String(record.id),
      cells: {
        name: asText(record.name),
        website: asText(record.website) || "-",
        order: asText(record.order),
        featured: featured ? "Yes" : "No",
        updatedAt: formatDate(record.updatedAt),
      },
      status: {
        label: featured ? "Featured" : "Hidden",
        tone: featured ? "success" : "slate",
      },
    };
  });

  return (
    <AdminShell {...props} breadcrumb={[{ label: "Partners" }]}>
      <div className="ts21-admin-view">
        <PageHeader
          eyebrow="Content"
          title="Partners"
          description="Festival partners shown on the landing and /partners page."
        />
        <ListJsTable
          addHref="/admin/collections/partners/create"
          addLabel="Add partner"
          columns={columns}
          editHrefBase="/admin/collections/partners"
          emptyDescription="Add festival partners and sponsors."
          emptyTitle="No partners yet"
          rows={rows}
          title="Partners"
        />
      </div>
    </AdminShell>
  );
}
