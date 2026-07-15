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
  return {
    title,
    openGraph: {
      title,
      description: data.novel.synopsis,
      type: "article",
      images: data.novel.coverImageUrl ? [{ url: data.novel.coverImageUrl }] : undefined,
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
    <main className="mx-auto max-w-2xl flex-1 px-4 py-16">
      <Link href={`/novels/${novel.slug}`} className="text-sm text-gray-500 underline">
        {novel.title}
      </Link>
      <h1 className="mt-2 mb-8 text-2xl font-bold text-gray-900">{chapter.title}</h1>

      <article
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: chapter.content }}
      />

      <nav className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
        {prevChapter ? (
          <Link
            href={`/novels/${novel.slug}/${prevChapter.slug}`}
            className="text-sm font-medium text-gray-700 underline"
          >
            ← {prevChapter.title}
          </Link>
        ) : (
          <span />
        )}
        {nextChapter ? (
          <Link
            href={`/novels/${novel.slug}/${nextChapter.slug}`}
            className="text-sm font-medium text-gray-700 underline"
          >
            {nextChapter.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <section id="comments" className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Comentarios {chapter.comments.length > 0 && `(${chapter.comments.length})`}
        </h2>

        <ul className="mt-4 space-y-4">
          {chapter.comments.map((comment) => (
            <li key={comment.id} className="rounded-md border border-gray-200 p-3">
              <p className="text-sm font-medium text-gray-900">{comment.authorName}</p>
              <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
            </li>
          ))}
          {chapter.comments.length === 0 && (
            <li className="text-sm text-gray-500">Se el primero en comentar.</li>
          )}
        </ul>

        <div className="mt-6">
          <CommentForm novelSlug={novel.slug} chapterSlug={chapter.slug} />
        </div>
      </section>
    </main>
  );
}
