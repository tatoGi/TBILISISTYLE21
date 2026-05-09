import Image from "next/image";
import Qvevri1 from "@/public/images/qvevriStage2.jpeg";
import Qvevri2 from "@/public/images/qvevriStage1.jpeg";
import { getTranslations } from "next-intl/server";

export default async function QvevriStagePage() {
  const t = await getTranslations("qvevriStage");

  return (
    <main className="w-full min-h-screen bg-black text-white pt-28">
      <section className="max-w-6xl mx-auto px-6 py-16 flex flex-col gap-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-[0.2em] text-center">
          {t("title")}
        </h2>

        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
          <Image
            src={Qvevri1}
            alt="Qvevri Stage Image 1"
            fill
            className="object-cover rounded-xl"
            sizes="100vw"
          />
        </div>

        <div className="flex flex-col gap-6 text-white/80 uppercase leading-relaxed text-sm md:text-base">
          <p>{t("intro")}</p>
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>{t("p3")}</p>
        </div>

        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
          <Image
            src={Qvevri2}
            alt="Qvevri Stage Image 2"
            fill
            className="object-cover rounded-xl"
            sizes="100vw"
          />
        </div>
      </section>
    </main>
  );
}
