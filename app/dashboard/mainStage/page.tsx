import Image from "next/image";
import MainStage1 from "@/public/images/mainStage1.jpeg";
import MainStage2 from "@/public/images/mainStage2.jpeg";

export default function MainStagePage() {
  return (
    <main className="w-full min-h-screen bg-black text-white">

      <section className="max-w-6xl mx-auto px-6 py-16 flex flex-col gap-12">

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-wider text-center">
            Main Stage
        </h2>

        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
          <Image
            src={MainStage1}
            alt="Main Stage Image 1"
            fill
            className="object-cover rounded-xl"
            sizes="100vw"
          />
        </div>

        <div className="flex flex-col gap-6 text-white/80 uppercase leading-relaxed text-sm md:text-base">
          <p>
            On the Main Stage, you can expect exciting surprises. At Tbilisi Style, DJs will have a unique DJ booth where well-known artists will showcase their skills and energize the space with a powerful vibe. In the background, you will see a 50–60 meter long vineyard wall, approximately 15 meters high, filled with hanging grape clusters. There will also be large screens and laser shows. Of course, everything will be executed at a European level with a Georgian style.
          </p>

          <p>
            Musically, the Main Stage will bring together different genres — Techno, Melodic Techno, Peak-Time Techno, House, and Afro House, creating a different energy and atmosphere every day.
          </p>

          <p>
            Every day, 6 DJs will perform on the Main Stage.
          </p>

          <p>
            The Main Stage experience will be made even more special by the fact that each day one young and talented DJ will have the opportunity to perform alongside major artists. This will be a unique chance for the new generation to share the stage, gain experience, and collaborate with professional DJs.
          </p>

          <p>
            The stage will also be equipped with moving screens, which will take on different shapes every day, creating a unique visual atmosphere and making each day visually distinctive.
          </p>
        </div>

        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
          <Image
            src={MainStage2}
            alt="Main Stage Image 2"
            fill
            className="object-cover rounded-xl"
            sizes="100vw"
          />
        </div>

      </section>

    </main>
  );
}