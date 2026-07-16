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

  const novel = await prisma.novel.findUnique({
    where: { id },
    include: { _count: { select: { chapters: true, images: true } } },
  });
  if (!novel) notFound();

  return (
    <div>
      <Link href="/admin/novels" className="admin-link">
        ← Novelas
      </Link>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="admin-page-title">{novel.title}</h1>
          <span className={`badge mt-2 inline-flex ${novel.status === "PUBLISHED" ? "badge-published" : "badge-draft"}`}>
            {novel.status === "PUBLISHED" ? "Publicada" : "Borrador"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/admin/novels/${novel.id}/chapters`} className="btn-admin-secondary">
            Capitulos ({novel._count.chapters})
          </Link>
          <Link href={`/admin/novels/${novel.id}/images`} className="btn-admin-secondary">
            Imagenes ({novel._count.images})
          </Link>
          <DeleteNovelButton id={novel.id} title={novel.title} />
        </div>
      </div>

      <div className="admin-card mt-8 max-w-2xl">
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
