import Image from "next/image";
import Link from "next/link";
import type { PartnerCard } from "@/lib/nav";

type Props = {
  partners: PartnerCard[];
  heading: string;
};

/**
 * Prominent featured-partners band for the festival landing. Renders nothing
 * when there are no featured partners, so the page stays clean until the admin
 * marks some with "Show on festival landing".
 */
export default function PartnersStrip({ partners, heading }: Props) {
  if (!partners.length) return null;

  return (
    <section className="w-full bg-black px-6 py-16 text-white md:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/partners"
          className="inline-block text-3xl font-extrabold uppercase tracking-tight transition hover:text-yellow-300 md:text-5xl"
        >
          {heading}
        </Link>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => {
            const inner = (
              <>
                <div className="flex aspect-[3/2] w-full items-center justify-center overflow-hidden bg-white/[0.04] p-6">
                  {partner.logoUrl ? (
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      width={240}
                      height={160}
                      className="max-h-full w-auto object-contain transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-sm font-bold uppercase tracking-wider text-white/70">
                      {partner.name}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="text-base font-extrabold uppercase leading-tight">
                    {partner.name}
                  </h3>
                  {partner.description ? (
                    <p className="line-clamp-3 text-sm leading-6 text-white/65">
                      {partner.description}
                    </p>
                  ) : null}
                </div>
              </>
            );

            const cardClass =
              "group flex flex-col overflow-hidden border border-white/10 bg-white/[0.03] transition hover:border-white/30";

            return partner.website ? (
              <a
                key={partner.id}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={partner.name}
                className={cardClass}
              >
                {inner}
              </a>
            ) : (
              <div key={partner.id} className={cardClass} aria-label={partner.name}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
