import type { AdminViewServerProps } from "payload";
import { getPayloadClient } from "@/lib/payload";
import { AdminShell, ListJsTable, PageHeader, type ListColumn, type ListRow } from "./_ui";

export const dynamic = "force-dynamic";

const columns: ListColumn[] = [
  { key: "title", label: "News" },
  { key: "slug", label: "Slug" },
  { key: "publishedAt", label: "Published" },
  { key: "status", label: "Status" },
  { key: "updatedAt", label: "Updated" },
];

function asText(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return String(record.ka || record.en || record.ru || record.ua || "");
  }
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

export default async function NewsListView(props: AdminViewServerProps) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    depth: 0,
    limit: 0,
    pagination: false,
    sort: "-publishedAt",
  });

  const rows: ListRow[] = result.docs.map((post) => {
    const record = post as unknown as Record<string, unknown>;
    const status = asText(record._status) || "published";

    return {
      id: String(record.id),
      cells: {
        publishedAt: formatDate(record.publishedAt),
        slug: asText(record.slug),
        status,
        title: asText(record.title),
        updatedAt: formatDate(record.updatedAt),
      },
      status: {
        label: status === "draft" ? "Draft" : "Published",
        tone: status === "draft" ? "slate" : "success",
      },
    };
  });

  return (
    <AdminShell {...props} breadcrumb={[{ label: "News" }]}>
      <div className="ts21-admin-view">
      <PageHeader eyebrow="Content" title="News" description="Unified List.js style news management." />
      <ListJsTable
        addHref="/admin/collections/posts/create"
        addLabel="Add news"
        columns={columns}
        editHrefBase="/admin/collections/posts"
        emptyDescription="Create festival news and announcements."
        emptyTitle="No news yet"
        rows={rows}
        title="News"
      />
      </div>
    </AdminShell>
  );
}
