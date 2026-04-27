import Image from "next/image";
import MainImg from "@/public/images/dashboardimage_1920x1080_full.jpeg";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      
      <Image
        src={MainImg}
        alt="Background"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_35%]"
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute top-0 left-0 right-0 z-10 pt-8 md:pt-12 lg:pt-16 text-center">
        <h1 className="text-[8vw] md:text-[3vw] lg:text-[2rem] font-black uppercase tracking-tight whitespace-nowrap text-white">
          TBILISI STYLE 21
        </h1>
        <p className="text-[3.5vw] md:text-[2vw] lg:text-[1.5rem] font-bold uppercase tracking-wide whitespace-nowrap text-white mt-1 md:mt-2">
          ELECTRONIC MUSIC FESTIVAL
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Link href="/dashboard/festival">
          <p className="text-[16px] md:text-[12px] lg:text-[20px] font-black uppercase tracking-tight whitespace-nowrap text-white cursor-pointer transition-colors duration-300 hover:text-yellow-400">
            ENTER THE ENERGY
          </p>
        </Link>
      </div>

    </main>
  );
}