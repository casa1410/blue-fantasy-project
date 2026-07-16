import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const novels = await prisma.novel.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    include: {
      chapters: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const slides: HeroSlide[] = novels
    .map((novel): HeroSlide | null => {
      const latestChapter = novel.chapters[0];
      const imageUrl = latestChapter?.coverImageUrl ?? novel.coverImageUrl;
      if (!latestChapter || !imageUrl) return null;
      return {
        href: `/novels/${novel.slug}/${latestChapter.slug}`,
        imageUrl,
        novelTitle: novel.title,
        chapterTitle: latestChapter.title,
      };
    })
    .filter((s): s is HeroSlide => s !== null)
    .slice(0, 8);

  return (
    <main className="flex-1">
      <section className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-12 px-6 py-16 sm:px-10 lg:flex-row lg:justify-between lg:py-24">
        <div className="max-w-xl text-center lg:text-left">
          <h1 className="font-display text-4xl leading-tight text-balance sm:text-5xl lg:text-6xl">
            ElFrikiSac
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-(--site-ink-soft)">
            Un recopilatorio de todo lo que escribo.
          </p>
          <Link href="#novelas" className="btn-glow mt-10 inline-flex">
            Explorar novelas
          </Link>
        </div>

        <div className="w-80 shrink-0 shadow-2xl shadow-black/50 sm:w-100">
          <HeroCarousel slides={slides} />
        </div>
      </section>

      <section id="novelas" className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <h2 className="section-title">Últimos escritos</h2>

        <div className="card-grid mt-10">
          {novels.map((novel) => (
            <Link key={novel.id} href={`/novels/${novel.slug}`} className="novel-card">
              <div className="novel-cover">
                {novel.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={novel.coverImageUrl} alt={novel.title} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#0d1220]">
                    <span className="font-display text-sm text-(--site-ink-faint)">
                      Sin portada
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                {novel.genre && <span className="genre-pill self-start">{novel.genre}</span>}
                <h3 className="font-display text-lg">{novel.title}</h3>
                <p className="line-clamp-3 text-sm text-(--site-ink-soft)">
                  {novel.synopsis}
                </p>
              </div>
            </Link>
          ))}

          {novels.length === 0 && (
            <p className="text-(--site-ink-faint)">
              Todavía no hay novelas publicadas — vuelve pronto.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
