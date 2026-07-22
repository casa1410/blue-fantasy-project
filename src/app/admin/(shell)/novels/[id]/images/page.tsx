import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { CoverUploadForm } from "@/components/admin/cover-upload-form";
import { ReferenceImages } from "@/components/admin/reference-images";

export default async function NovelImagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;

  const novel = await prisma.novel.findFirst({
    where: { id, deletedAt: null },
    include: { images: { where: { chapterId: null }, orderBy: { createdAt: "desc" } } },
  });
  if (!novel) notFound();

  return (
    <div>
      <Link href={`/admin/novels/${novel.id}/edit`} className="admin-link">
        ← {novel.title}
      </Link>
      <h1 className="admin-page-title mt-3">Imagenes</h1>

      <div className="admin-card mt-8 max-w-2xl">
        <CoverUploadForm novelId={novel.id} currentUrl={novel.coverImageUrl} />
      </div>

      <div className="admin-card mt-6">
        <ReferenceImages novelId={novel.id} images={novel.images} />
      </div>
    </div>
  );
}
