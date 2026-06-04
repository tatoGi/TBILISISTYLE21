import FestivalMenu from "../components/FestivalMenu";
import Footer from "../components/Footer";
import TicketCta from "../components/TicketCta";
import { getNavPages } from "@/lib/nav";

export default async function FestivalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pages = await getNavPages();

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white">
      <FestivalMenu pages={pages} />
      <div className="flex-1">{children}</div>
      <Footer />
      <TicketCta />
    </div>
  );
}
