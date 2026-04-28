import Image from "next/image";
import MissionImg from "@/public/images/mission.jpeg";

export default function MissionVisionPage() {
  return (
    <main className="w-full min-h-screen bg-black text-white">

      <section className="max-w-5xl mx-auto px-6 py-16 flex flex-col gap-14">

        {/* TITLE */}
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-[0.2em]">
            Mission & Vision
          </h2>
          <p className="text-sm md:text-base text-white/60 uppercase">
            Tbilisi Style 21
          </p>
        </div>

        {/* LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* VERTICAL IMAGE */}
          <div className="w-full lg:w-[40%] flex justify-center">
            <div className="relative w-[240px] sm:w-[280px] md:w-[320px] lg:w-[360px]">
              <Image
                src={MissionImg}
                alt="Mission Vision"
                className="w-full h-auto object-contain rounded-xl"
                priority
              />
            </div>
          </div>

          {/* TEXT */}
          <div className="w-full lg:w-[60%] flex flex-col gap-6 uppercase leading-relaxed text-sm md:text-base text-white/80">

            <p>
              Through Tbilisi Style, I want to unite Georgian culture with the modernity of today’s music.
            </p>

            <p>
              I want to show the world what Georgians are capable of when we create the right space and the right opportunities. We have the potential to create a festival that will make its mark on the world stage.
            </p>

            <p>
              The Tbilisi Style festival will give many talented young people the chance to explore the club and festival world more deeply and fully express their talent.
            </p>

            <p>
              Georgians have always been closely connected to music. A sense of rhythm, energy, and emotion comes naturally to us.
            </p>

            <p>
              I believe that after Tbilisi Style, even more powerful DJs will emerge in Georgia — artists who will show the world Georgian potential and Georgian character.
            </p>

            <p>
              My goal is to bring Tbilisi Style 21 to the global market and, through this path, contribute to the development of this industry in Georgia, which will inspire even greater interest among young people.
            </p>

            <p>
              I want to show the world a festival created in Georgia, in the spirit of Tbilisi, with its own unique energy and character.
            </p>

            <p>
              I look at the world: in France, Spain, Dubai, Egypt — festivals are created everywhere. Georgia possesses everything needed for an event of this scale: mountains, the sea, the unique atmosphere of Old Tbilisi, and easily accessible locations.
            </p>

            <p className="text-yellow-300 font-semibold">
              I believe we have the potential to create a festival that will make its mark on the world stage.
            </p>

            <p className="text-white font-bold mt-4">
              Tbilisi Style 21
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}