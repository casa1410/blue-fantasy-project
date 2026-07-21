import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { NovelChapterList } from "@/components/novel-chapter-list";
import { CoverLightbox } from "@/components/cover-lightbox";

export const dynamic = "force-dynamic";

async function getNovel(slug: string) {
  return prisma.novel.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      chapters: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
      },
      images: { where: { chapterId: null }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const novel = await getNovel(slug);
  if (!novel) return {};
  return {
    title: novel.title,
    description: novel.synopsis,
    openGraph: {
      title: novel.title,
      description: novel.synopsis,
      type: "book",
      images: novel.coverImageUrl ? [{ url: novel.coverImageUrl }] : undefined,
    },
  };
}

export default async function NovelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const novel = await getNovel(slug);
  if (!novel) notFound();

  return (
    <main className="mx-auto max-w-4xl flex-1 px-6 py-16 sm:px-10">
      <Link href="/" className="site-link text-sm">
        ← Todas las novelas
      </Link>

      <div className="mt-6 flex flex-col gap-8 sm:flex-row">
        {novel.coverImageUrl ? (
          <CoverLightbox
            src={novel.coverImageUrl}
            alt={novel.title}
            triggerClassName="novel-cover h-80 w-56 shrink-0 self-center rounded-xl shadow-xl shadow-black/40 sm:h-auto sm:max-h-120 sm:w-64 sm:self-stretch"
          />
        ) : (
          <div className="novel-cover h-80 w-56 shrink-0 self-center rounded-xl shadow-xl shadow-black/40 sm:h-auto sm:max-h-120 sm:w-64 sm:self-stretch">
            <div className="flex h-full w-full items-center justify-center bg-[#0d1220]">
              <span className="font-display text-sm text-(--site-ink-faint)">Sin portada</span>
            </div>
          </div>
        )}
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">{novel.title}</h1>
          {novel.genre && <span className="genre-pill mt-3 inline-block">{novel.genre}</span>}
          <p className="mt-5 leading-relaxed text-(--site-ink-soft)">{novel.synopsis}</p>
          {novel.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {novel.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {novel.images.length > 0 && (
        <div className="mt-14">
          <h2 className="section-title text-2xl">Imágenes de referencia</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {novel.images.map((image) => (
              <div key={image.id} className="site-card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.altText ?? ""}
                  className="h-32 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <NovelChapterList
        novelSlug={novel.slug}
        chapters={novel.chapters.map((c) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          publishedAt: c.publishedAt ? c.publishedAt.toISOString() : null,
        }))}
      />
    </main>
  );
}
