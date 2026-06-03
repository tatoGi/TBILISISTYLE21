import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(253,224,71,0.14),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_38%)]" />
      <div className="absolute inset-0 bg-black/55" />

      <section className="relative z-10 flex max-w-2xl flex-col items-center text-center uppercase">
        <p className="text-sm font-bold tracking-[0.45em] text-yellow-300">
          {t("eyebrow")}
        </p>

        <h1 className="mt-5 text-[clamp(5rem,22vw,11rem)] font-black leading-none tracking-normal">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-extrabold tracking-[0.18em] sm:text-4xl">
          {t("title")}
        </h2>

        <p className="mt-5 max-w-xl text-sm font-semibold leading-7 text-white/65 sm:text-base">
          {t("description")}
        </p>

        <Link
          href="/dashboard/festival"
          className="mt-9 rounded-full border border-yellow-300/70 bg-yellow-300 px-6 py-3 text-xs font-extrabold tracking-normal text-black shadow-[0_0_28px_rgba(253,224,71,0.24)] transition-all duration-200 hover:border-white hover:bg-white"
        >
          {t("back")}
        </Link>
      </section>
    </main>
  );
}
