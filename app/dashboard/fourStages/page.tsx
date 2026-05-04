import { getTranslations } from "next-intl/server";

export default async function StagesPage() {
  const t = await getTranslations("fourStages");

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "140px 40px 80px",
        lineHeight: "1.8",
      }}
    >
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        {t("title")}
      </h1>

      <div style={{ whiteSpace: "pre-line", fontSize: "16px", lineHeight: "1.6" }}>
        {t("body")}
      </div>
    </main>
  );
}
