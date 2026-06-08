import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getCurrentLocale, getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

function mediaUrl(media: unknown): string | null {
  if (media && typeof media === "object" && "url" in media) {
    return (media as { url?: string }).url ?? null;
  }
  return null;
}

export default async function PartnersPage() {
  const payload = await getPayloadClient();
  const locale = await getCurrentLocale();
  const t = await getTranslations("nav");

  const result = await payload.find({
    collection: "partners",
    locale,
    fallbackLocale: "ka",
    depth: 1,
    sort: "order",
    limit: 100,
  });

  const partners = result.docs;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 pb-16 pt-28 text-white md:px-10">
      <div className="grid gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
          Tbilisi Style 21
        </p>
        <h1 className="text-4xl font-extrabold uppercase md:text-6xl">
          {t("partners")}
        </h1>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {partners.length ? (
          partners.map((partner) => {
            const url = mediaUrl(partner.logo);
            const name = (partner.name as string) || "";
            const description = (partner.description as string)?.trim();
            const website = (partner.website as string)?.trim();

            const inner = (
              <>
                <div className="flex aspect-[3/2] w-full items-center justify-center overflow-hidden bg-white/[0.04] p-6">
                  {url ? (
                    <Image
                      src={url}
                      alt={name}
                      width={240}
                      height={160}
                      className="max-h-full w-auto object-contain transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-sm font-bold uppercase tracking-wider text-white/70">
                      {name}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h2 className="text-base font-extrabold uppercase leading-tight">
                    {name}
                  </h2>
                  {description ? (
                    <p className="line-clamp-3 text-sm leading-6 text-white/65">
                      {description}
                    </p>
                  ) : null}
                </div>
              </>
            );

            const cardClass =
              "group flex flex-col overflow-hidden border border-white/10 bg-white/[0.03] transition hover:border-white/30";

            return website ? (
              <a
                key={partner.id}
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
                aria-label={name}
              >
                {inner}
              </a>
            ) : (
              <div key={partner.id} className={cardClass} aria-label={name}>
                {inner}
              </div>
            );
          })
        ) : (
          <p className="col-span-full border border-white/10 p-5 text-white/60">
            No partners yet.
          </p>
        )}
      </div>
    </main>
  );
}
