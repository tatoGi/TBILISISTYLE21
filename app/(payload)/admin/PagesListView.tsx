import type { AdminViewServerProps } from "payload";
import { getPayloadClient } from "@/lib/payload";
import { AdminShell, ListJsTable, PageHeader, type ListColumn, type ListRow } from "./_ui";

export const dynamic = "force-dynamic";

const columns: ListColumn[] = [
  { key: "title", label: "Page" },
  { key: "slug", label: "Slug" },
  { key: "navOrder", label: "Nav order", align: "right" },
  { key: "flags", label: "Flags" },
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

export default async function PagesListView(props: AdminViewServerProps) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    depth: 0,
    limit: 0,
    pagination: false,
    sort: "navOrder",
  });

  const rows: ListRow[] = result.docs.map((page) => {
    const record = page as unknown as Record<string, unknown>;
    const status = asText(record._status) || "published";
    const flags = [
      record.showInNav ? { label: "Nav", tone: "info" as const } : null,
      record.featuredOnHome ? { label: "Home", tone: "warning" as const } : null,
    ].filter(Boolean) as ListRow["flags"];

    return {
      id: String(record.id),
      cells: {
        flags: flags?.map((flag) => flag.label).join(", ") ?? "",
        navOrder: String(record.navOrder ?? 100),
        slug: asText(record.slug),
        status,
        title: asText(record.title_ka) || asText(record.title),
        updatedAt: formatDate(record.updatedAt),
      },
      flags,
      status: {
        label: status === "draft" ? "Draft" : "Published",
        tone: status === "draft" ? "slate" : "success",
      },
    };
  });

  return (
    <AdminShell {...props} breadcrumb={[{ label: "Pages" }]}>
      <div className="ts21-admin-view">
        <PageHeader
          eyebrow="Content"
          title="Pages"
          description="List.js style page list with add, edit and remove controls for content operations."
        />
        <ListJsTable
          addHref="/admin/collections/pages/create"
          addLabel="Add page"
          columns={columns}
          defaultSortKey="navOrder"
          deleteKind="page"
          editHrefBase="/admin/collections/pages"
          emptyDescription="Create the first content page in the Payload editor (hero, blocks, SEO, publish)."
          emptyTitle="No pages yet"
          rows={rows}
          title="Pages"
        />
      </div>
    </AdminShell>
  );
}
