"use client";

import Image from "next/image";
import AboutImg from "@/public/images/secondImg_1920x1080.jpeg";
import { useEffect, useState } from "react";

const navItems = [
  { label: "MAIN STAGE" },
  { label: "QVEVRI" },
  { label: "TECHNO QVEVRI" },
  { label: "LINEUP" },
  { label: "JOKER" },
  { label: "UKRAINIAN DAY" },
  { label: "4 STAGES" },
  { label: "OUR STORY" },
  { label: "TICKET" },
  { label: "MISSION" },
  { label: "PARTNERS" },
  { label: "NEWS" },
  { label: "FOOD ZONE" },
  { label: "VACANCIES" },
  { label: "CONTACT US" },
  { label: "FESTIVAL RULES & TERMS" },
];

const slogan =
  "STAND IN THE CENTRE OF THE WORLD WITH BIG STARS AND FEEL THEIR ENERGY";

export default function AboutPage() {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "auto";
  }, [navOpen]);

  return (
    <main className="relative w-full min-h-screen overflow-hidden">
      <Image
        src={AboutImg}
        alt="Background"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/40" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-5">
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            letterSpacing: "0.1em",
          }}
          className="text-white text-2xl font-bold uppercase hidden sm:block"
        >
          Tbilisi Style 21
        </span>

        <div className="flex items-center gap-5">
          <a
            href="#"
            style={{
              fontFamily: "'Courier New', monospace",
              letterSpacing: "0.1em",
            }}
            className="text-white text-sm font-bold uppercase hover:text-yellow-300 transition-colors hidden sm:block"
          >
            Buy Ticket
          </a>

          <button
            onClick={() => setNavOpen((prev) => !prev)}
            className="relative z-50 flex flex-col justify-center items-center w-9 h-9 cursor-pointer"
          >
            <span
              className="block w-6 h-[2px] bg-white absolute transition-all"
              style={{
                transform: navOpen ? "rotate(45deg)" : "translateY(-7px)",
              }}
            />
            <span
              className="block w-6 h-[2px] bg-white absolute transition-all"
              style={{ opacity: navOpen ? 0 : 1 }}
            />
            <span
              className="block w-6 h-[2px] bg-white absolute transition-all"
              style={{
                transform: navOpen ? "rotate(-45deg)" : "translateY(7px)",
              }}
            />
          </button>
        </div>
      </div>

      <div
        className="fixed inset-0 z-40 bg-black transition-opacity duration-300"
        style={{
          opacity: navOpen ? 0.6 : 0,
          pointerEvents: navOpen ? "auto" : "none",
        }}
        onClick={() => setNavOpen(false)}
      />

      {/* Drawer */}
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
          
          <button
            onClick={() => setNavOpen(false)}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center"
          >
            <span className="block w-6 h-[2px] bg-white rotate-45 absolute" />
            <span className="block w-6 h-[2px] bg-white -rotate-45 absolute" />
          </button>

          {/* Nav */}
          <nav className="flex flex-col flex-1 justify-center">
            {navItems.map((item, i) => (
              <a
                key={item.label}
                href="#"
                onClick={() => setNavOpen(false)}
                style={{
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: "0.1em",
                  fontSize: "clamp(0.75rem, 2.2vh, 1.05rem)",
                  padding: "clamp(6px,1.2vh,10px) 0",
                  borderBottom:
                    i < navItems.length - 1
                      ? "1px solid rgba(255,255,255,0.07)"
                      : "none",
                }}
                className="uppercase font-bold text-white hover:text-yellow-300 transition-all"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="w-full h-[1px] bg-white/20 my-4" />

          <p
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "clamp(0.6rem, 1.4vh, 0.8rem)",
            }}
            className="text-white/50 uppercase"
          >
            {slogan}
          </p>

          <a
            href="#"
            className="sm:hidden mt-6 text-center text-white border border-white/40 hover:border-yellow-300 hover:text-yellow-300 transition uppercase font-bold py-3"
          >
            Buy Ticket
          </a>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 text-white uppercase">

          {/* LEFT SIDE */}
          <div className="flex flex-col gap-10">

            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold cursor-pointer transition-all duration-200 hover:text-yellow-300 hover:scale-[1.03]">
                Ukrainian Day
              </p>
              <p className="text-xs md:text-sm opacity-70 mt-1">
                20.08.2027
              </p>
            </div>

            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold cursor-pointer transition-all duration-200 hover:text-yellow-300 hover:scale-[1.03]">
                Joker Tickets
              </p>
            </div>

            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold cursor-pointer transition-all duration-200 hover:text-yellow-300 hover:scale-[1.03]">
                Our Mission
              </p>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col gap-10 md:items-end md:text-right">

            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold cursor-pointer transition-all duration-200 hover:text-yellow-300 hover:scale-[1.03]">
                Main Stage
              </p>
            </div>

            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold cursor-pointer transition-all duration-200 hover:text-yellow-300 hover:scale-[1.03]">
                Qvevri Stage
              </p>
            </div>

            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold cursor-pointer transition-all duration-200 hover:text-yellow-300 hover:scale-[1.03]">
                Techno Qvevri
              </p>
              <p className="text-xs md:text-sm opacity-70 mt-1">
                11.09.2027
              </p>
            </div>

          </div>

        </div>
      </div>

      </main>
  );
}