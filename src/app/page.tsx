import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const novels = await prisma.novel.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl flex-1 px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900">BlueFantasyProject</h1>
      <p className="mt-2 text-gray-600">Novelas y relatos originales.</p>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {novels.map((novel) => (
          <Link
            key={novel.id}
            href={`/novels/${novel.slug}`}
            className="flex gap-4 rounded-lg border border-gray-200 p-4 transition hover:border-gray-400"
          >
            {novel.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={novel.coverImageUrl}
                alt={novel.title}
                className="h-32 w-24 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="h-32 w-24 shrink-0 rounded bg-gray-100" />
            )}
            <div>
              <h2 className="font-semibold text-gray-900">{novel.title}</h2>
              {novel.genre && <p className="text-sm text-gray-500">{novel.genre}</p>}
              <p className="mt-2 line-clamp-3 text-sm text-gray-600">{novel.synopsis}</p>
            </div>
          </Link>
        ))}

        {novels.length === 0 && (
          <p className="text-gray-500">Todavia no hay novelas publicadas.</p>
        )}
      </div>
    </main>
  );
}
