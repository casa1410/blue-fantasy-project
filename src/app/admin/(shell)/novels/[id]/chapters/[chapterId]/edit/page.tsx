import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { ChapterEditForm } from "@/components/admin/chapter-edit-form";
import { ChapterCoverUpload } from "@/components/admin/chapter-cover-upload";

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  await requireAdminUser();
  const { id, chapterId } = await params;

  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, novelId: id },
  });
  if (!chapter) notFound();

  return (
    <div>
      <Link href={`/admin/novels/${id}/chapters`} className="admin-link">
        ← Capitulos
      </Link>
      <h1 className="admin-page-title mt-3 mb-8">{chapter.title}</h1>

      <div className="admin-card mb-6 max-w-2xl">
        <ChapterCoverUpload
          novelId={id}
          chapterId={chapter.id}
          currentUrl={chapter.coverImageUrl}
        />
      </div>

      <div className="admin-card max-w-2xl">
        <ChapterEditForm
          novelId={id}
          chapter={{
            id: chapter.id,
            title: chapter.title,
            content: chapter.content,
            status: chapter.status,
          }}
        />
      </div>
    </div>
  );
}
