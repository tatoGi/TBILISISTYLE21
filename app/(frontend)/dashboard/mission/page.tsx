import Image from "next/image";
import MissionImg from "@/public/images/mission.jpeg";
import { getTranslations } from "next-intl/server";
import ContentPageLayout from "../../components/content/ContentPageLayout";
import ContentProse from "../../components/content/ContentProse";

export default async function MissionVisionPage() {
  const t = await getTranslations("mission");

  return (
    <ContentPageLayout
      title={t("title")}
      subtitle={t("subtitle")}
      eyebrow="Tbilisi Style 21"
      contentWidth="wide"
    >
      <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
        <div className="mx-auto w-full max-w-sm shrink-0 lg:mx-0 lg:max-w-xs">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={MissionImg}
              alt="Mission"
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        </div>

        <ContentProse>
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>{t("p3")}</p>
          <p>{t("p4")}</p>
          <p>{t("p5")}</p>
          <p>{t("p6")}</p>
          <p>{t("p7")}</p>
          <p className="font-semibold text-white">{t("signature")}</p>
        </ContentProse>
      </div>
    </ContentPageLayout>
  );
}
