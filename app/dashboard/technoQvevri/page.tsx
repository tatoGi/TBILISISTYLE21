import Image from "next/image";
import TechnoRaveImg from "@/public/images/technoqvevri.jpeg";

export default function TechnoRavePage() {
  return (
    <main className="w-full min-h-screen bg-black text-white">

      <section className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-12 items-center">

        {/* TITLE */}
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-[0.2em]">
            TECHNO RAVE — QVEVRI
          </h2>
          <p className="text-sm md:text-base text-white/60 uppercase">
            September 11
          </p>
        </div>

        <div className="w-full flex justify-center">
          <div className="relative w-[260px] sm:w-[320px] md:w-[380px] lg:w-[420px]">
            <Image
              src={TechnoRaveImg}
              alt="Techno Rave Qvevri"
              className="w-full h-auto object-contain rounded-xl"
              priority
            />
          </div>
        </div>

        {/* TEXT */}
        <div className="flex flex-col gap-5 text-white/80 uppercase leading-relaxed text-sm md:text-base text-center">

          <p>We begin a new night inside the Qvevri.</p>

          <p>This is not a lounge.</p>
          <p>This is not soft techno.</p>

          <p className="text-white font-semibold">
            This is unstoppable, heavy TECHNO RAVE.
          </p>

          <p>
            After Tbilisi Style 21 and the Qvevri Festival, on September 11, 2027, we invite you into the Great Qvevri, where the music will not stop.
          </p>

          <p>
            Leading European DJs will try to saturate the thick walls of the Qvevri with the energy of heavy and relentless techno.
          </p>

          <p>
            This will be the first night when the Great Qvevri in Georgia turns completely red, and the people inside will feel like pressed grapes.
          </p>

          <p>
            If you have never experienced true exhaustion while dancing — this is your night.
          </p>

          <p className="text-white font-semibold mt-4">
            September 11 <br />
            QVEVRI & TECHNO RAVE
          </p>

          <p>A unique night with European techno artists.</p>

          <p>
            We welcome only those who are ready for pure energy on the dancefloor.
          </p>

          <p className="text-yellow-300 font-semibold">
            To purchase tickets, visit the tickets section.
          </p>

        </div>

      </section>

    </main>
  );
}