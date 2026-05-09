import { getTranslations } from "next-intl/server";

export default async function RulesPage() {
  const t = await getTranslations("rulesAndTerms");

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "140px 40px",
        lineHeight: "1.8",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "36px",
          marginBottom: "60px",
          fontWeight: "bold",
        }}
      >
        {t("title")}
      </h1>

      <div style={{ whiteSpace: "pre-line", fontSize: "16px" }}>
        {t("body")}
      </div>
    </main>
  );
}
