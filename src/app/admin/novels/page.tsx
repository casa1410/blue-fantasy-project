import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";

export default async function AdminNovelsPage() {
  await requireAdminUser();

  const novels = await prisma.novel.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { chapters: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Novelas</h1>
        <Link
          href="/admin/novels/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Nueva novela
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-gray-200 border-t border-gray-200">
        {novels.length === 0 && (
          <li className="py-6 text-sm text-gray-500">Todavia no hay novelas.</li>
        )}
        {novels.map((novel) => (
          <li key={novel.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-gray-900">{novel.title}</p>
              <p className="text-sm text-gray-500">
                {novel.status === "PUBLISHED" ? "Publicada" : "Borrador"} ·{" "}
                {novel._count.chapters} capitulo(s)
              </p>
            </div>
            <Link
              href={`/admin/novels/${novel.id}/edit`}
              className="text-sm font-medium text-gray-700 underline"
            >
              Editar
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
