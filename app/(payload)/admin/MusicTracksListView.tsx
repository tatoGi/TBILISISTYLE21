import type { AdminViewServerProps } from "payload";
import { listMusicTracks } from "@/lib/music-tracks";
import { AdminShell, ListJsTable, PageHeader, type ListColumn, type ListRow } from "./_ui";

export const dynamic = "force-dynamic";

const columns: ListColumn[] = [
  { key: "title", label: "Title" },
  { key: "artist", label: "Artist" },
  { key: "order", label: "Order", align: "right" },
  { key: "status", label: "Status" },
];

const statusTone: Record<string, ListRow["status"]> = {
  draft: { label: "Draft", tone: "slate" },
  active: { label: "Active", tone: "success" },
};

export default async function MusicTracksListView(props: AdminViewServerProps) {
  const tracks = await listMusicTracks();
  const rows: ListRow[] = tracks.map((track) => ({
    id: track.id,
    cells: {
      title: track.title,
      artist: track.artist || "-",
      order: String(track.order),
      status: statusTone[track.status]?.label ?? track.status,
    },
    status: statusTone[track.status] ?? { label: track.status, tone: "slate" },
  }));

  return (
    <AdminShell {...props} breadcrumb={[{ label: "Music Tracks" }]}>
      <div className="ts21-admin-view">
        <PageHeader
          eyebrow="Content"
          title="Music Tracks"
          description="Manage the track list shown on the festival page."
        />
        <ListJsTable
          addHref="/admin/collections/musicTracks/create"
          addLabel="Add track"
          columns={columns}
          editHrefBase="/admin/collections/musicTracks"
          emptyDescription="Upload audio tracks for the festival music library."
          emptyTitle="No music tracks yet"
          rows={rows}
          title="Music tracks"
        />
      </div>
    </AdminShell>
  );
}
