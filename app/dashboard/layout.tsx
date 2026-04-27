"use client";

import { useState, useEffect } from "react";
import FestivalMenu from "../components/FestivalMenu";

export default function FestivalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "auto";
  }, [navOpen]);

  return (
    <div className="relative min-h-screen bg-black text-white">
      <FestivalMenu navOpen={navOpen} setNavOpen={setNavOpen} />
      {children}
    </div>
  );
}