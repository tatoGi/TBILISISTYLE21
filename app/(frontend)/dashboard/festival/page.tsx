import AboutImg from "@/public/images/secondImg_1920x1080.jpeg";
import { getTranslations } from "next-intl/server";
import { getFestivalHeroContent, getFestivalMusic } from "@/lib/festival-landing";
import { getFeaturedPages, getFeaturedPartners, getFeaturedNews } from "@/lib/nav";
import { listProducts } from "@/lib/products";
import { listMusicTracks } from "@/lib/music-tracks";
import FestivalHero from "../../components/festival/FestivalHero";
import FestivalMusic from "../../components/festival/FestivalMusic";
import MusicTrackList from "../../components/festival/MusicTrackList";
import ProductReel from "../../components/ProductReel";
import PartnersStrip from "../../components/PartnersStrip";
import NewsTeaser from "../../components/NewsTeaser";

export const dynamic = "force-dynamic";

export default async function FestivalPage() {
  const tNav = await getTranslations("nav");
  const tHome = await getTranslations("home");
  const t = await getTranslations("festivalLanding");

  const [hero, featured, products, partners, featuredNews, music, musicTracks] = await Promise.all([
    getFestivalHeroContent(),
    getFeaturedPages(),
    listProducts({ publicOnly: true }),
    getFeaturedPartners(),
    getFeaturedNews(6),
    getFestivalMusic(),
    listMusicTracks({ publicOnly: true }),
  ]);

  return (
    <main className="relative w-full bg-black">
      <FestivalHero
        image={AboutImg}
        badge={hero.badge}
        pages={featured}
        emptyPagesMessage={t("emptyFeatured")}
      />

      <PartnersStrip partners={partners} heading={tNav("partners")} />

      <ProductReel products={products} />

      <NewsTeaser
        posts={featuredNews}
        heading={tNav("news")}
        viewAllLabel={tHome("allNews")}
      />

      <MusicTrackList tracks={musicTracks} />

      {music ? (
        <FestivalMusic src={music.url} title={music.title} loop={music.loop} />
      ) : null}
    </main>
  );
}
