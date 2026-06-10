import { getTranslations } from "next-intl/server";
import Qvevri1 from "@/public/images/qvevriStage2.jpeg";
import Qvevri2 from "@/public/images/qvevriStage1.jpeg";
import ContentFigure from "../../components/content/ContentFigure";
import ContentPageLayout from "../../components/content/ContentPageLayout";
import ContentProse from "../../components/content/ContentProse";

export default async function QvevriStagePage() {
  const t = await getTranslations("qvevriStage");

  return (
    <ContentPageLayout
      title={t("title")}
      eyebrow="Tbilisi Style 21"
      heroImage={Qvevri1}
      contentWidth="wide"
    >
      <ContentFigure src={Qvevri1} alt="Qvevri Stage" priority />

      <ContentProse>
        <p>{t("intro")}</p>
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
      </ContentProse>

      <div className="mt-10">
        <ContentFigure src={Qvevri2} alt="Qvevri Stage" />
      </div>
    </ContentPageLayout>
  );
}
