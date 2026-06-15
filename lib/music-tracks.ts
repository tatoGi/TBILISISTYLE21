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

export async function listMusicTracks({
  publicOnly = false,
}: { publicOnly?: boolean } = {}): Promise<MusicTrack[]> {
  const payload = await getPayloadClient();

  let locale: string;
  try {
    locale = await getCurrentLocale();
  } catch {
    locale = "ka";
  }

  const result = await payload.find({
    collection: "musicTracks",
    where: publicOnly ? { status: { equals: "active" } } : {},
    sort: "order",
    limit: 0,
    pagination: false,
    depth: 1,
  });

  return result.docs
    .map((doc) => {
      const d = doc as unknown as Record<string, unknown>;
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
