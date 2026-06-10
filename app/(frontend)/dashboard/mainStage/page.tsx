import { getTranslations } from "next-intl/server";
import MainStage1 from "@/public/images/mainstage11.jpeg";
import MainStage2 from "@/public/images/mainstage22.jpeg";
import ContentFigure from "../../components/content/ContentFigure";
import ContentPageLayout from "../../components/content/ContentPageLayout";
import ContentProse from "../../components/content/ContentProse";

export default async function MainStagePage() {
  const t = await getTranslations("mainStage");

  return (
    <ContentPageLayout
      title={t("title")}
      eyebrow="Tbilisi Style 21"
      heroImage={MainStage1}
      contentWidth="wide"
    >
      <ContentFigure src={MainStage1} alt="Main Stage" priority />

      <ContentProse>
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
        <p>{t("p4")}</p>
        <p>{t("p5")}</p>
      </ContentProse>

      <div className="mt-10">
        <ContentFigure src={MainStage2} alt="Main Stage" />
      </div>
    </ContentPageLayout>
  );
}
