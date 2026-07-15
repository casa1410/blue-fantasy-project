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
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div>
        <Link href={`/admin/novels/${novel.id}/edit`} className="text-sm text-gray-500 underline">
          Volver a {novel.title}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          Capitulos de &quot;{novel.title}&quot;
        </h1>
      </div>

      <ChapterQuickCreateForm novelId={novel.id} />
      <ChapterList novelId={novel.id} chapters={novel.chapters} />
    </div>
  );
}
