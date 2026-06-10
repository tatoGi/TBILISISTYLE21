import Image from "next/image";
import TechnoRaveImg from "@/public/images/technoqvevri.jpeg";
import { getTranslations } from "next-intl/server";
import ContentPageLayout from "../../components/content/ContentPageLayout";
import ContentProse from "../../components/content/ContentProse";

export default async function TechnoRavePage() {
  const t = await getTranslations("technoQvevri");

  return (
    <ContentPageLayout
      title={t("title")}
      subtitle={t("date")}
      eyebrow="Tbilisi Style 21"
      heroImage={TechnoRaveImg}
      contentWidth="wide"
    >
      <div className="mx-auto flex max-w-md justify-center">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={TechnoRaveImg}
            alt="Techno Qvevri"
            className="h-auto w-full object-contain"
            priority
          />
        </div>
      </div>

      <ContentProse>
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
        <p className="font-semibold text-white">{t("p4")}</p>
        <p>{t("p5")}</p>
        <p>{t("p6")}</p>
        <p>{t("p7")}</p>
        <p>{t("p8")}</p>
        <p className="font-semibold text-white">
          {t("date")}
          <br />
          {t("eventName")}
        </p>
        <p>{t("p9")}</p>
        <p>{t("p10")}</p>
        <p className="font-semibold text-yellow-300">{t("ticketNote")}</p>
      </ContentProse>
    </ContentPageLayout>
  );
}
