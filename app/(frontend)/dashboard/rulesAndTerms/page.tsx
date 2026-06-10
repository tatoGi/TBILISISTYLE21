import { getTranslations } from "next-intl/server";
import ContentPageLayout from "../../components/content/ContentPageLayout";
import ContentProse from "../../components/content/ContentProse";

export default async function RulesPage() {
  const t = await getTranslations("rulesAndTerms");

  return (
    <ContentPageLayout title={t("title")} eyebrow="Tbilisi Style 21">
      <ContentProse>
        <p className="whitespace-pre-line">{t("body")}</p>
      </ContentProse>
    </ContentPageLayout>
  );
}
