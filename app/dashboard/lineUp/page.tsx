import Image from "next/image";
import { getTranslations } from "next-intl/server";

import img1 from "@/public/lineups/tbilisistyleday1.jpeg";
import img2 from "@/public/lineups/tbilisistyleday2.jpeg";
import img3 from "@/public/lineups/tbilisistyleday3.jpeg";
import img4 from "@/public/lineups/rave.jpeg";

export default async function LineUpPage() {
  const t = await getTranslations("lineUp");

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "100px 40px 40px",
      }}
    >
      <section style={{ marginBottom: "80px" }}>
        <h1
          style={{
            fontSize: "36px",
            marginBottom: "40px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {t("festivalTitle")}
          <div
            style={{
              fontSize: "14px",
              color: "#888",
            }}
          >
            27-29.08.2027
          </div>
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {[img1, img2, img3].map((img, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                width: "100%",
                height: "420px",
                overflow: "hidden",
                borderRadius: "18px",
              }}
            >
              <Image
                src={img}
                alt={`lineup ${i}`}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2
          style={{
            fontSize: "32px",
            marginBottom: "40px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {t("raveTitle")}
          <br />
          <div
            style={{
              fontSize: "14px",
              color: "#888",
            }}
          >
            {t("raveDate")}
          </div>
        </h2>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              position: "relative",
              width: "300px",
              height: "420px",
              borderRadius: "18px",
              overflow: "hidden",
            }}
          >
            <Image
              src={img4}
              alt="kvevri rave"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
