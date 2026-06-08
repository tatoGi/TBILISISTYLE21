import type { AdminViewServerProps } from "payload";
import { getPayloadClient } from "@/lib/payload";
import { AdminShell, ListJsTable, PageHeader, type ListColumn, type ListRow } from "./_ui";

export const dynamic = "force-dynamic";

const columns: ListColumn[] = [
  { key: "filename", label: "File" },
  { key: "alt", label: "Alt" },
  { key: "mimeType", label: "Type" },
  { key: "size", label: "Size", align: "right" },
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

function formatBytes(value: unknown) {
  const bytes = Number(value ?? 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return "-";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value: unknown) {
  if (typeof value !== "string") return "-";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function MediaListView(props: AdminViewServerProps) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "media",
    depth: 0,
    limit: 0,
    pagination: false,
    sort: "-updatedAt",
  });

  const rows: ListRow[] = result.docs.map((media) => {
    const record = media as unknown as Record<string, unknown>;
    const mimeType = asText(record.mimeType);

    return {
      id: String(record.id),
      cells: {
        alt: asText(record.alt_ka) || asText(record.alt),
        filename: asText(record.filename) || asText(record.url),
        mimeType: mimeType || "file",
        size: formatBytes(record.filesize),
        updatedAt: formatDate(record.updatedAt),
      },
      flags: mimeType.startsWith("image/")
        ? [{ label: "Image", tone: "info" }]
        : mimeType.startsWith("video/")
          ? [{ label: "Video", tone: "warning" }]
          : [],
    };
  });

  return (
    <AdminShell {...props} breadcrumb={[{ label: "Media" }]}>
      <div className="ts21-admin-view">
      <PageHeader eyebrow="Content" title="Media" description="Unified media library list for uploads and assets." />
      <ListJsTable
        addHref="/admin/collections/media/create"
        addLabel="Upload media"
        columns={columns}
        editHrefBase="/admin/collections/media"
        emptyDescription="Upload images and videos used by pages, news and shop."
        emptyTitle="No media yet"
        rows={rows}
        title="Media"
      />
      </div>
    </AdminShell>
  );
}
