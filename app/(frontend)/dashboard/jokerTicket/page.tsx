import Image from "next/image";
import joker1 from "@/public/images/joker1.jpeg";
import joker2 from "@/public/images/joker2.jpeg";
import { getTranslations } from "next-intl/server";
import ContentFigure from "../../components/content/ContentFigure";
import ContentPageLayout from "../../components/content/ContentPageLayout";
import ContentProse from "../../components/content/ContentProse";

export default async function JokerTicketPage() {
  const t = await getTranslations("jokerTicket");
  const tNav = await getTranslations("nav");

  return (
    <ContentPageLayout
      title={tNav("jokerTicket")}
      eyebrow="Tbilisi Style 21"
      heroImage={joker1}
      contentWidth="wide"
    >
      <ContentFigure src={joker1} alt="Joker Ticket" priority />

      <ContentProse>
        <p className="whitespace-pre-line">{t("body")}</p>
      </ContentProse>

      <div className="mx-auto mt-10 max-w-sm">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={joker2}
            alt="Joker"
            className="h-auto w-full object-cover"
          />
        </div>
      </div>
    </ContentPageLayout>
  );
}
