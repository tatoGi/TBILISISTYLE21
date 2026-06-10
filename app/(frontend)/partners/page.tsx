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
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-5 pb-16 pt-28 text-white md:px-10 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(253,224,71,0.035)_0%,transparent_75%)]" />

      <div className="relative z-10 grid gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
          Tbilisi Style 21
        </p>
        <h1 className="font-heading text-4xl font-extrabold uppercase tracking-wide md:text-6xl">
          {t("partners")}
        </h1>
      </div>

      <div className="relative z-10 mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {partners.length ? (
          partners.map((partner) => {
            const url = mediaUrl(partner.logo);
            const name = (partner.name as string) || "";
            const description = (partner.description as string)?.trim();
            const website = (partner.website as string)?.trim();

            const inner = (
              <>
                <div className="relative flex aspect-[3/2] w-full items-center justify-center overflow-hidden bg-white/[0.02] p-6 border-b border-white/5">
                  {url ? (
                    <>
                      <Image
                        src={url}
                        alt={name}
                        width={240}
                        height={160}
                        className="max-h-full w-auto object-contain opacity-70 transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-20" />
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="px-4 text-center text-xs font-extrabold uppercase tracking-[0.25em] text-white/60 transition-all duration-500 group-hover:tracking-[0.3em] group-hover:text-white">
                        {name}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-yellow-300/0 transition-all duration-500 group-hover:scale-125 group-hover:bg-yellow-300" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-5">
                  <h2 className="font-heading text-base font-extrabold uppercase leading-tight text-white transition-colors duration-300 group-hover:text-yellow-300">
                    {name}
                  </h2>
                  {description ? (
                    <p className="line-clamp-3 text-xs leading-relaxed text-white/50">
                      {description}
                    </p>
                  ) : null}
                </div>
              </>
            );

            const cardClass =
              "group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-yellow-300/30 hover:bg-white/[0.03] hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)]";

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
          <p className="col-span-full rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-white/40 backdrop-blur-md">
            No partners yet.
          </p>
        )}
      </div>
    </main>
  );
}
