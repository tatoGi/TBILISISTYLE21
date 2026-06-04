import type { AdminViewServerProps } from "payload";
import { getPayloadClient } from "@/lib/payload";
import { AdminShell, Button, ListJsTable, PageHeader, type ListColumn, type ListRow } from "./_ui";

export const dynamic = "force-dynamic";

const columns: ListColumn[] = [
  { key: "label", label: "Label" },
  { key: "page", label: "Page" },
  { key: "slug", label: "Slug" },
  { key: "order", label: "Order", align: "right" },
];

function asText(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return String(record.ka || record.en || record.ru || record.ua || "");
  }
  return "";
}

export default async function MenuView(props: AdminViewServerProps) {
  const payload = await getPayloadClient();
  const site = await payload.findGlobal({ slug: "site", depth: 1 });
  const menu = Array.isArray(site.menu) ? site.menu : [];

  const rows: ListRow[] = menu.map((item, index) => {
    const record = item as Record<string, unknown>;
    const page = record.page && typeof record.page === "object" ? (record.page as Record<string, unknown>) : {};

    return {
      id: String(record.id || page.id || index),
      cells: {
        label: asText(record.label) || asText(page.title),
        order: String(index + 1),
        page: asText(page.title),
        slug: asText(page.slug),
      },
    };
  });

  return (
    <AdminShell {...props} breadcrumb={[{ label: "Menu" }]}>
      <div className="ts21-admin-view">
      <PageHeader
        eyebrow="Content"
        title="Menu"
        description="Site navigation overview. Use edit to reorder and change labels."
        actions={<Button href="/admin/globals/site">Edit menu</Button>}
      />
      <ListJsTable
        addHref="/admin/globals/site"
        addLabel="Edit menu"
        columns={columns}
        editHrefPattern="/admin/globals/site"
        emptyDescription="Open menu editor and add pages to the public navigation."
        emptyTitle="Menu is empty"
        rows={rows}
        title="Menu"
      />
      </div>
    </AdminShell>
  );
}
