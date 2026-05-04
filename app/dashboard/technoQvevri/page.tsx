import Image from "next/image";
import TechnoRaveImg from "@/public/images/technoqvevri.jpeg";
import { getTranslations } from "next-intl/server";

export default async function TechnoRavePage() {
  const t = await getTranslations("technoQvevri");

  return (
    <main className="w-full min-h-screen bg-black text-white">
      <section className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-12 items-center">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-[0.2em]">
            {t("title")}
          </h2>
          <p className="text-sm md:text-base text-white/60 uppercase">
            {t("date")}
          </p>
        </div>

        <div className="w-full flex justify-center">
          <div className="relative w-[260px] sm:w-[320px] md:w-[380px] lg:w-[420px]">
            <Image
              src={TechnoRaveImg}
              alt="Techno Rave Qvevri"
              className="w-full h-auto object-contain rounded-xl"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col gap-5 text-white/80 uppercase leading-relaxed text-sm md:text-base text-center">
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>{t("p3")}</p>
          <p className="text-white font-semibold">{t("p4")}</p>
          <p>{t("p5")}</p>
          <p>{t("p6")}</p>
          <p>{t("p7")}</p>
          <p>{t("p8")}</p>

          <p className="text-white font-semibold mt-4">
            {t("date")} <br />
            {t("eventName")}
          </p>

          <p>{t("p9")}</p>
          <p>{t("p10")}</p>
          <p className="text-yellow-300 font-semibold">{t("ticketNote")}</p>
        </div>
      </section>
    </main>
  );
}
