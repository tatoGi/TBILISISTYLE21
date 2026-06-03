import FestivalMenu from "../components/FestivalMenu";
import { getNavPages } from "@/lib/nav";

export default async function FestivalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pages = await getNavPages();

  return (
    <div className="relative min-h-screen bg-black text-white">
      <FestivalMenu pages={pages} />
      {children}
    </div>
  );
}
