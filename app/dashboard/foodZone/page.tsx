import Image from "next/image";
import { getTranslations } from "next-intl/server";

import foodzone1 from "@/public/images/foodzone1.jpeg";
import foodzone2 from "@/public/images/foodzone2.jpeg";

export default async function FoodAndBarsPage() {
  const t = await getTranslations("foodZone");

  return (
    <main
      style={{
        padding: "140px 40px 60px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "36px",
          fontWeight: "bold",
          marginBottom: "50px",
        }}
      >
        {t("title")}
      </h1>

      <div
        style={{
          whiteSpace: "pre-line",
          fontSize: "16px",
          lineHeight: "1.6",
        }}
      >
        {t("body")}
      </div>

      <div
        style={{
          marginTop: "50px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <Image
          src={foodzone1}
          alt="Food Zone 1"
          width={1200}
          height={600}
          style={{
            width: "100%",
            height: "380px",
            objectFit: "cover",
            borderRadius: "12px",
          }}
        />

        <Image
          src={foodzone2}
          alt="Food Zone 2"
          width={1200}
          height={600}
          style={{
            width: "100%",
            height: "380px",
            objectFit: "cover",
            borderRadius: "12px",
          }}
        />
      </div>
    </main>
  );
}
