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
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href={`/admin/novels/${id}/chapters`} className="text-sm text-gray-500 underline">
        Volver a capitulos
      </Link>
      <h1 className="mt-2 mb-8 text-2xl font-semibold text-gray-900">Editar capitulo</h1>

      <div className="mb-8">
        <ChapterCoverUpload
          novelId={id}
          chapterId={chapter.id}
          currentUrl={chapter.coverImageUrl}
        />
      </div>

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
  );
}
