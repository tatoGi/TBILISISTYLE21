import Image from "next/image";
import Qvevri1 from "@/public/images/qvevriStage2.jpeg";
import Qvevri2 from "@/public/images/qvevriStage1.jpeg";

export default function QvevriStagePage() {
  return (
    <main className="w-full min-h-screen bg-black text-white">

      <section className="max-w-6xl mx-auto px-6 py-16 flex flex-col gap-12">

        {/* TITLE */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-[0.2em] text-center">
          Qvevri Stage
        </h2>

        {/* IMAGE 1 */}
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
          <Image
            src={Qvevri1}
            alt="Qvevri Stage Image 1"
            fill
            className="object-cover rounded-xl"
            sizes="100vw"
          />
        </div>

        {/* TEXT */}
        <div className="flex flex-col gap-6 text-white/80 uppercase leading-relaxed text-sm md:text-base">

          <p>
            Qvevri Stage – Tbilisi Style 21 Festival
          </p>

          <p>
            At the Tbilisi Style 21 festival, you will encounter a massive Qvevri-shaped structure. Since ancient times, Georgians have used qvevris for winemaking a tradition that spans centuries and represents one of the most important parts of Georgian culture. The unique method of fermenting wine in qvevris has introduced Georgia to the world as one of the oldest and most distinguished homelands of winemaking art.
          </p>

          <p>
            Now, you will have the opportunity to fully “squeeze yourselves like grapes” inside the giant qvevri, where techno-loving DJs will perform. Unlike the main stage, they will deliver a heavier, darker, and more industrial sound direction including hard techno, industrial techno, peak-time techno, and underground rave sounds providing guests with maximum energy and intensity throughout the festival.
          </p>

          <p>
            Inside the qvevri, the ceiling will feature the unique three Georgian alphabets. In the center of the stage, there will be a massive inverted triangular LED screen, creating a strong visual focal point for the entire space. Additionally, there will be two balconies for Joker and VIP zones. The total capacity of the qvevri will be 7,000 people.
          </p>

        </div>

        {/* IMAGE 2 */}
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
          <Image
            src={Qvevri2}
            alt="Qvevri Stage Image 2"
            fill
            className="object-cover rounded-xl"
            sizes="100vw"
          />
        </div>

      </section>

    </main>
  );
}