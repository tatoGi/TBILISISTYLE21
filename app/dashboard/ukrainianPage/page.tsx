"use client";

import Image from "next/image";
import UkrainianImg from "@/public/images/ukrainianday.jpeg";
import { useEffect, useState } from "react";
import { navItems } from "@/app/components/navItems";


const slogan =
  "STAND IN THE CENTRE OF THE WORLD WITH BIG STARS AND FEEL THEIR ENERGY";

export default function UkrainianDayPage() {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "auto";
  }, [navOpen]);

  return (
    <main className="relative w-full min-h-screen bg-black text-white overflow-hidden">

      {/* OVERLAY */}
      <div
        className="fixed inset-0 z-40 bg-black transition-opacity duration-300"
        style={{
          opacity: navOpen ? 0.6 : 0,
          pointerEvents: navOpen ? "auto" : "none",
        }}
        onClick={() => setNavOpen(false)}
      />

      {/* DRAWER (EXACT SAME STYLE AS ABOUT PAGE) */}
      <div
        className="fixed top-0 right-0 z-50 h-full flex flex-col transition-transform duration-300"
        style={{
          transform: navOpen ? "translateX(0)" : "translateX(100%)",
          width: "min(100vw, 360px)",
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex flex-col h-full overflow-y-auto px-8 pt-28 pb-8 relative">

          {/* CLOSE */}
          <button
            onClick={() => setNavOpen(false)}
            className="absolute top-6 right-6 w-8 h-8"
          >
            <span className="block w-6 h-[2px] bg-white rotate-45 absolute" />
            <span className="block w-6 h-[2px] bg-white -rotate-45 absolute" />
          </button>

          {/* NAV */}
          <nav className="flex flex-col flex-1 justify-center gap-0">
            {navItems.map((item, i) => (
              <a
                key={item.label}
                href="#"
                onClick={() => setNavOpen(false)}
                style={{
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: "0.1em",
                  fontSize: "clamp(0.75rem, 2.2vh, 1.05rem)",
                  paddingTop: "clamp(5px, 1.2vh, 10px)",
                  paddingBottom: "clamp(5px, 1.2vh, 10px)",
                  borderBottom:
                    i < navItems.length - 1
                      ? "1px solid rgba(255,255,255,0.07)"
                      : "none",
                }}
                className="block uppercase font-bold text-white hover:text-yellow-300 hover:pl-2 transition-all duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* DIVIDER */}
          <div className="w-full h-[1px] bg-white/20 mt-4 mb-4" />

          {/* SLOGAN */}
          <p
            style={{
              fontFamily: "'Courier New', monospace",
              letterSpacing: "0.08em",
              lineHeight: "1.8",
              fontSize: "clamp(0.6rem, 1.4vh, 0.8rem)",
            }}
            className="text-white/50 uppercase font-semibold"
          >
            {slogan}
          </p>

          {/* MOBILE BUTTON */}
          <a
            href="#"
            className="sm:hidden mt-6 text-center text-white border border-white/40 hover:border-yellow-300 hover:text-yellow-300 transition uppercase font-bold text-sm py-3"
          >
            Buy Ticket
          </a>

        </div>
      </div>

      {/* HERO IMAGE */}
      <div className="relative w-full h-screen">
        <Image
          src={UkrainianImg}
          alt="Ukrainian Day"
          fill
          priority
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute bottom-10 left-6 md:left-12 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-wider">
            Ukrainian Day
          </h1>
          <p className="mt-2 text-sm opacity-80">
            28.08.2027 • Tbilisi Style 21
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-6 uppercase leading-relaxed text-sm md:text-base">

        <p className="text-white/80">
          The second day of the Tbilisi Style 21 festival will be dedicated to Ukrainian Day. On this day, the Main Stage, Qvevri, and other central areas will be fully powered by the energy of Ukrainian DJs, creating a unique atmosphere.
        </p>

        <p className="text-white/80">
          Ukrainian representatives will open and close the festival, sharing their energy and showcasing their talent on a global stage.
        </p>

        <p className="text-white/80">
          If you have never experienced Ukrainian artists on a big stage, this is your opportunity to become part of it.
        </p>

        <p className="text-yellow-300 font-semibold">
          Don’t miss the Ukrainian vibe in Tbilisi.
        </p>

        <p className="text-white/80">
          The organization of Ukrainian Day is led by Aisha from Kyiv, a talented and dedicated young professional who is shaping the future of this project.
        </p>

        <p className="text-white font-bold mt-4">
          28.08.2027 — See you in Tbilisi for Ukrainian Day.
        </p>

      </div>

    </main>
  );
}