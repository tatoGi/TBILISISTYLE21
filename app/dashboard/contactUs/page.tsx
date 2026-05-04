import Image from "next/image";
import { getTranslations } from "next-intl/server";

import img1 from "@/public/paymentLogo/Visa_Brandmark_White_RGB_2021.png";
import img2 from "@/public/paymentLogo/ms_hrz_opt_rev_75_3x.png";

export default async function ContactPage() {
  const t = await getTranslations("contactUs");

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "140px 40px 80px",
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

      <div
        style={{
          textAlign: "center",
          fontSize: "16px",
          lineHeight: "1.8",
          marginBottom: "60px",
        }}
      >
        {t("phone")}: +995 558 35 83 62
        <br />
        {t("email")}: Tbilisistyle21@gmail.com
      </div>

      <h2
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        {t("payments")}
      </h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "60px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "140px",
            height: "90px",
          }}
        >
          <Image src={img1} alt="Visa" fill style={{ objectFit: "contain" }} />
        </div>

        <div
          style={{
            position: "relative",
            width: "180px",
            height: "90px",
          }}
        >
          <Image
            src={img2}
            alt="Mastercard"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
    </main>
  );
}
