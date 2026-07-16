import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { ChapterList } from "@/components/admin/chapter-list";
import { ChapterQuickCreateForm } from "@/components/admin/chapter-quick-create-form";

export default async function NovelChaptersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;

  const novel = await prisma.novel.findUnique({
    where: { id },
    include: { chapters: { orderBy: { order: "asc" } } },
  });
  if (!novel) notFound();

  return (
    <div>
      <Link href={`/admin/novels/${novel.id}/edit`} className="admin-link">
        ← {novel.title}
      </Link>
      <h1 className="admin-page-title mt-3">Capitulos</h1>
      <p className="admin-page-sub">{novel.chapters.length} capitulo(s).</p>

      <div className="admin-card mt-8">
        <p className="admin-label">Nuevo capitulo</p>
        <div className="mt-3">
          <ChapterQuickCreateForm novelId={novel.id} />
        </div>
      </div>

      <div className="admin-card mt-6">
        <ChapterList novelId={novel.id} chapters={novel.chapters} />
      </div>
    </div>
  );
}
