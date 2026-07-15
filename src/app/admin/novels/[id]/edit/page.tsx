import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { NovelForm } from "@/components/admin/novel-form";
import { DeleteNovelButton } from "@/components/admin/delete-novel-button";

export default async function EditNovelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;

  const novel = await prisma.novel.findUnique({ where: { id } });
  if (!novel) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Editar novela</h1>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/admin/novels/${novel.id}/chapters`}
            className="text-sm font-medium text-gray-700 underline"
          >
            Capitulos
          </Link>
          <Link
            href={`/admin/novels/${novel.id}/images`}
            className="text-sm font-medium text-gray-700 underline"
          >
            Imagenes
          </Link>
          <DeleteNovelButton id={novel.id} title={novel.title} />
        </div>
      </div>

      <div className="mt-8">
        <NovelForm
          novel={{
            id: novel.id,
            title: novel.title,
            synopsis: novel.synopsis,
            genre: novel.genre,
            tags: novel.tags,
            status: novel.status,
          }}
        />
      </div>
    </div>
  );
}
