import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

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
  return { title: novel.title, description: novel.synopsis };
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
    <main className="mx-auto max-w-3xl flex-1 px-4 py-16">
      <Link href="/" className="text-sm text-gray-500 underline">
        Todas las novelas
      </Link>

      <div className="mt-4 flex gap-6">
        {novel.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={novel.coverImageUrl}
            alt={novel.title}
            className="h-56 w-40 shrink-0 rounded object-cover"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{novel.title}</h1>
          {novel.genre && <p className="mt-1 text-sm text-gray-500">{novel.genre}</p>}
          <p className="mt-4 text-gray-700">{novel.synopsis}</p>
          {novel.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {novel.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {novel.images.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">Imagenes de referencia</h2>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {novel.images.map((image) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={image.id}
                src={image.url}
                alt={image.altText ?? ""}
                className="h-32 w-full rounded object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Capitulos</h2>
        <ul className="mt-4 divide-y divide-gray-200 border-t border-gray-200">
          {novel.chapters.map((chapter, index) => (
            <li key={chapter.id}>
              <Link
                href={`/novels/${novel.slug}/${chapter.slug}`}
                className="flex items-center justify-between py-3 text-gray-800 hover:text-gray-950"
              >
                <span>
                  {index + 1}. {chapter.title}
                </span>
              </Link>
            </li>
          ))}
          {novel.chapters.length === 0 && (
            <li className="py-4 text-sm text-gray-500">
              Todavia no hay capitulos publicados.
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
