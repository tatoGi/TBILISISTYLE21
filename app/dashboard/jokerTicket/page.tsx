import joker1 from "@/public/images/joker1.jpeg";
import joker2 from "@/public/images/joker2.jpeg";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function JokerTicketPage() {
  const t = await getTranslations("jokerTicket");

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "140px 40px" }}>
      <div style={{ marginBottom: "40px" }}>
        <Image
          src={joker1}
          alt="Joker Hero Image"
          width={1200}
          height={500}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "18px",
            objectFit: "cover",
          }}
          priority
        />
      </div>

      <div
        style={{
          whiteSpace: "pre-line",
          fontSize: "16px",
          lineHeight: "1.7",
          marginBottom: "50px",
        }}
      >
        {t("body")}
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <Image
          src={joker2}
          alt="Joker Portrait Image"
          width={400}
          height={600}
          style={{
            borderRadius: "18px",
            objectFit: "cover",
          }}
        />
      </div>
    </main>
  );
}
