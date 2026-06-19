import { unstable_cache } from "next/cache";
import { getCurrentLocale, getPayloadClient } from "./payload";
import { pickLocalized } from "./i18n-content";

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  order: number;
  status: "active" | "draft";
};

// Locale-independent raw rows (title localized in JS by pickLocalized), so one
// cache entry serves every locale. revalidate 5 min / revalidateTag "music-tracks".
const fetchMusicTrackDocs = unstable_cache(
  async (publicOnly: boolean) => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "musicTracks",
      where: publicOnly ? { status: { equals: "active" } } : {},
      sort: "order",
      limit: 0,
      pagination: false,
      depth: 1,
    });
    return result.docs as unknown as Record<string, unknown>[];
  },
  ["music-tracks-docs"],
  { revalidate: 300, tags: ["music-tracks"] },
);

export async function listMusicTracks({
  publicOnly = false,
}: { publicOnly?: boolean } = {}): Promise<MusicTrack[]> {
  let locale: string;
  try {
    locale = await getCurrentLocale();
  } catch {
    locale = "ka";
  }

  // This runs in the root layout on every page. If the DB is unavailable (e.g.
  // the data-transfer quota is exhausted), degrade to an empty list rather than
  // throwing — otherwise the layout's Promise.all rejects and 500s every route,
  // including the static homepage.
  let docs: Record<string, unknown>[];
  try {
    docs = await fetchMusicTrackDocs(publicOnly);
  } catch {
    return [];
  }

  return docs
    .map((d) => {
      const audioFile = d.audioFile;
      const url =
        audioFile && typeof audioFile === "object" && "url" in audioFile
          ? ((audioFile as { url?: string }).url ?? null)
          : null;
      if (!url) return null;

      return {
        id: String(d.id),
        title: pickLocalized<string>(d, "title", locale) ?? "",
        artist: (d.artist as string) ?? "",
        audioUrl: url,
        order: Number(d.order ?? 0),
        status: (d.status as "active" | "draft") ?? "draft",
      };
    })
    .filter((t): t is MusicTrack => t !== null);
}
