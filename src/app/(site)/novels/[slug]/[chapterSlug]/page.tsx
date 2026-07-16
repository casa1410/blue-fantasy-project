import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CommentForm } from "@/components/comment-form";

export const dynamic = "force-dynamic";

async function getChapterData(novelSlug: string, chapterSlug: string) {
  const novel = await prisma.novel.findFirst({
    where: { slug: novelSlug, status: "PUBLISHED" },
    include: {
      chapters: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        include: {
          comments: {
            where: { status: "APPROVED" },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
  if (!novel) return null;

  const chapterIndex = novel.chapters.findIndex((c) => c.slug === chapterSlug);
  if (chapterIndex === -1) return null;

  return {
    novel,
    chapter: novel.chapters[chapterIndex],
    prevChapter: novel.chapters[chapterIndex - 1] ?? null,
    nextChapter: novel.chapters[chapterIndex + 1] ?? null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapterSlug: string }>;
}): Promise<Metadata> {
  const { slug, chapterSlug } = await params;
  const data = await getChapterData(slug, chapterSlug);
  if (!data) return {};
  const title = `${data.chapter.title} · ${data.novel.title}`;
  const coverImage = data.chapter.coverImageUrl ?? data.novel.coverImageUrl;
  return {
    title,
    openGraph: {
      title,
      description: data.novel.synopsis,
      type: "article",
      images: coverImage ? [{ url: coverImage }] : undefined,
    },
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapterSlug: string }>;
}) {
  const { slug, chapterSlug } = await params;
  const data = await getChapterData(slug, chapterSlug);
  if (!data) notFound();

  const { novel, chapter, prevChapter, nextChapter } = data;

  return (
    <main className="mx-auto max-w-2xl flex-1 px-6 py-16 sm:px-10">
      <Link href={`/novels/${novel.slug}`} className="site-link text-sm">
        ← {novel.title}
      </Link>
      <h1 className="font-display mt-3 mb-6 text-3xl">{chapter.title}</h1>

      {(chapter.coverImageUrl ?? novel.coverImageUrl) && (
        <div className="mb-10 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={chapter.coverImageUrl ?? novel.coverImageUrl ?? undefined}
            alt={chapter.title}
            className="h-80 w-auto rounded-xl object-contain shadow-xl shadow-black/40 sm:h-96"
          />
        </div>
      )}

      <article
        className="prose prose-invert chapter-prose max-w-none"
        dangerouslySetInnerHTML={{ __html: chapter.content }}
      />

      <nav className="mt-14 flex items-center justify-between gap-4 border-t border-(--site-line) pt-6">
        {prevChapter ? (
          <Link
            href={`/novels/${novel.slug}/${prevChapter.slug}`}
            className="site-link text-sm font-medium"
          >
            ← {prevChapter.title}
          </Link>
        ) : (
          <span />
        )}
        {nextChapter ? (
          <Link
            href={`/novels/${novel.slug}/${nextChapter.slug}`}
            className="site-link text-sm font-medium"
          >
            {nextChapter.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <section id="comments" className="mt-14 border-t border-(--site-line) pt-8">
        <h2 className="section-title text-xl">
          Comentarios {chapter.comments.length > 0 && `(${chapter.comments.length})`}
        </h2>

        <ul className="mt-5 space-y-4">
          {chapter.comments.map((comment) => (
            <li key={comment.id} className="site-card p-4">
              <p className="text-sm font-medium">{comment.authorName}</p>
              <p className="mt-1 text-sm whitespace-pre-wrap text-(--site-ink-soft)">
                {comment.body}
              </p>
            </li>
          ))}
          {chapter.comments.length === 0 && (
            <li className="text-sm text-(--site-ink-faint)">Sé el primero en comentar.</li>
          )}
        </ul>

        <div className="mt-6">
          <CommentForm novelSlug={novel.slug} chapterSlug={chapter.slug} />
        </div>
      </section>
    </main>
  );
}
