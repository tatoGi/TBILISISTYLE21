import Image from "next/image";
import MissionImg from "@/public/images/mission.jpeg";
import { getTranslations } from "next-intl/server";

export default async function MissionVisionPage() {
  const t = await getTranslations("mission");

  return (
    <main className="w-full min-h-screen bg-black text-white pt-28">
      <section className="max-w-5xl mx-auto px-6 py-16 flex flex-col gap-14">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-[0.2em]">
            {t("title")}
          </h2>
          <p className="text-sm md:text-base text-white/60 uppercase">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-[40%] flex justify-center">
            <div className="relative w-[240px] sm:w-[280px] md:w-[320px] lg:w-[360px]">
              <Image
                src={MissionImg}
                alt="Mission Vision"
                className="w-full h-auto object-contain rounded-xl"
                priority
              />
            </div>
          </div>

          <div className="w-full lg:w-[60%] flex flex-col gap-6 uppercase leading-relaxed text-sm md:text-base text-white/80">
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
            <p>{t("p3")}</p>
            <p>{t("p4")}</p>
            <p>{t("p5")}</p>
            <p>{t("p6")}</p>
            <p>{t("p7")}</p>
            <p className="text-white font-bold mt-4">{t("signature")}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
