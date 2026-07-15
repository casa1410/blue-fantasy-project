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

  const novel = await prisma.novel.findUnique({
    where: { id },
    include: { images: { where: { chapterId: null }, orderBy: { createdAt: "desc" } } },
  });
  if (!novel) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-10">
      <div>
        <Link
          href={`/admin/novels/${novel.id}/edit`}
          className="text-sm text-gray-500 underline"
        >
          Volver a {novel.title}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          Imagenes de &quot;{novel.title}&quot;
        </h1>
      </div>

      <CoverUploadForm novelId={novel.id} currentUrl={novel.coverImageUrl} />
      <ReferenceImages novelId={novel.id} images={novel.images} />
    </div>
  );
}
