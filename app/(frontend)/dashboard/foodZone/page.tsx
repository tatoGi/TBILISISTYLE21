import { getTranslations } from "next-intl/server";
import foodzone1 from "@/public/images/foodzone1.jpeg";
import foodzone2 from "@/public/images/foodzone2.jpeg";
import ContentFigure from "../../components/content/ContentFigure";
import ContentPageLayout from "../../components/content/ContentPageLayout";
import ContentProse from "../../components/content/ContentProse";

export default async function FoodAndBarsPage() {
  const t = await getTranslations("foodZone");

  return (
    <ContentPageLayout
      title={t("title")}
      eyebrow="Tbilisi Style 21"
      heroImage={foodzone1}
      contentWidth="wide"
    >
      <ContentProse>
        <p className="whitespace-pre-line">{t("body")}</p>
      </ContentProse>

      <div className="mt-10 flex flex-col gap-5">
        <ContentFigure src={foodzone1} alt="Food Zone 1" />
        <ContentFigure src={foodzone2} alt="Food Zone 2" />
      </div>
    </ContentPageLayout>
  );
}
