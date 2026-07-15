import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const novels = await prisma.novel.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
  });

  const featured = novels.find((n) => n.coverImageUrl) ?? null;

  return (
    <main className="flex-1">
      <section className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-12 px-6 py-16 sm:px-10 lg:flex-row lg:justify-between lg:py-24">
        <div className="max-w-xl text-center lg:text-left">
          <h1 className="font-display text-4xl leading-tight text-balance sm:text-5xl lg:text-6xl">
            Creaciones de ElFrikiSac.
            <br />
            Mundos infinitos.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-(--site-ink-soft)">
            BlueFantasyProject reúne las novelas y relatos de ElFrikiSac — fantasía, aventura
            y ciencia ficción tejidas en un mismo multiverso de personajes y misterios.
          </p>
          <Link href="#novelas" className="btn-glow mt-10 inline-flex">
            Explorar novelas
          </Link>
        </div>

        <div className="novel-cover h-95 w-70 shrink-0 rounded-2xl shadow-2xl shadow-black/50 sm:h-120 sm:w-85">
          {featured?.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={featured.coverImageUrl} alt={featured.title} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#121830] to-[#070b14]">
              <span className="font-display text-lg text-(--site-ink-faint)">
                BlueFantasyProject
              </span>
            </div>
          )}
        </div>
      </section>

      <section id="novelas" className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <h2 className="section-title">Últimas novelas</h2>

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
