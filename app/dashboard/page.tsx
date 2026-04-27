import Image from "next/image";
import AboutImg from "@/public/images/secondImg_1920x1080.jpeg";

export default function AboutPage() {
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

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 text-center">
        
      </div>

    </main>
  );
}