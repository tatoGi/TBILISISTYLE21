import Image from "next/image";
import { getTranslations } from "next-intl/server";
import img1 from "@/public/lineups/tbilisistyleday1.jpeg";
import img2 from "@/public/lineups/tbilisistyleday2.jpeg";
import img3 from "@/public/lineups/tbilisistyleday3.jpeg";
import img4 from "@/public/lineups/rave.jpeg";
import ContentPageLayout from "../../components/content/ContentPageLayout";

export default async function LineUpPage() {
  const t = await getTranslations("lineUp");

  return (
    <ContentPageLayout
      title={t("festivalTitle")}
      subtitle="27–29.08.2027"
      eyebrow="Tbilisi Style 21"
      contentWidth="full"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[img1, img2, img3].map((img, i) => (
          <figure
            key={i}
            className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10"
          >
            <Image
              src={img}
              alt={`Lineup day ${i + 1}`}
              fill
              className="object-cover transition duration-500 hover:scale-105"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          </figure>
        ))}
      </div>

      <section className="mt-20 text-center">
        <h2 className="font-heading text-2xl font-extrabold uppercase tracking-[0.1em] sm:text-3xl">
          {t("raveTitle")}
        </h2>
        <p className="font-heading mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/55">
          {t("raveDate")}
        </p>

        <figure className="relative mx-auto mt-10 aspect-[3/4] w-full max-w-xs overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={img4}
            alt="Kvevri rave"
            fill
            className="object-cover"
            sizes="320px"
          />
        </figure>
      </section>
    </ContentPageLayout>
  );
}
