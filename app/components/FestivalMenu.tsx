"use client";

import Link from "next/link";
import { navItems } from "./navItems";



const slogan =
  "STAND IN THE CENTRE OF THE WORLD WITH BIG STARS AND FEEL THEIR ENERGY";

export default function FestivalMenu({ navOpen, setNavOpen }: any) {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-5">

        <Link href="/dashboard/festival">
          <span className="text-white text-3xl sm:text-4xl font-extrabold uppercase hidden sm:block tracking-wider">
            Tbilisi Style 21
          </span>
        </Link>

        <button
          onClick={() => setNavOpen(!navOpen)}
          className="relative z-50 w-9 h-9 flex flex-col justify-center items-center"
        >
          <span
            className="w-6 h-[2px] bg-white absolute"
            style={{
              transform: navOpen ? "rotate(45deg)" : "translateY(-7px)",
            }}
          />
          <span
            className="w-6 h-[2px] bg-white absolute"
            style={{ opacity: navOpen ? 0 : 1 }}
          />
          <span
            className="w-6 h-[2px] bg-white absolute"
            style={{
              transform: navOpen ? "rotate(-45deg)" : "translateY(7px)",
            }}
          />
        </button>
      </div>

      <div
        className="fixed inset-0 z-40 bg-black transition-opacity"
        style={{
          opacity: navOpen ? 0.6 : 0,
          pointerEvents: navOpen ? "auto" : "none",
        }}
        onClick={() => setNavOpen(false)}
      />

      {/* DRAWER */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-[360px] max-w-full bg-black/90 backdrop-blur-md transition-transform"
        style={{
          transform: navOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="h-full flex flex-col px-8 pt-28 pb-8 overflow-y-auto relative">

          <button
            onClick={() => setNavOpen(false)}
            className="absolute top-6 right-6 w-8 h-8"
          >
            <span className="w-6 h-[2px] bg-white rotate-45 absolute" />
            <span className="w-6 h-[2px] bg-white -rotate-45 absolute" />
          </button>

          <nav className="flex flex-col flex-1 justify-center gap-0">
            {navItems.map((item, i) => (
              <a
                key={item.label}
                href="#"
                onClick={() => setNavOpen(false)}
                className="uppercase font-bold text-white hover:text-yellow-300 hover:pl-2 transition-all duration-200"
                style={{
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: "0.1em",
                  fontSize: "clamp(0.75rem, 2.2vh, 1.05rem)",
                  padding: "10px 0",
                  borderBottom:
                    i < navItems.length - 1
                      ? "1px solid rgba(255,255,255,0.07)"
                      : "none",
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="w-full h-[1px] bg-white/20 my-4" />

          <p className="text-white/50 uppercase text-xs leading-6">
            {slogan}
          </p>
        </div>
      </div>
    </>
  );
}