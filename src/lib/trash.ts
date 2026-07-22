import { prisma } from "@/lib/prisma";
import { deleteImageFile } from "@/lib/storage";

export const TRASH_RETENTION_DAYS = 30;

export async function hardDeleteNovel(novelId: string) {
  const novel = await prisma.novel.findUnique({
    where: { id: novelId },
    include: { images: true, chapters: { include: { images: true } } },
  });
  if (!novel) return;

  const paths = [
    novel.coverImagePath,
    ...novel.images.map((i) => i.storagePath),
    ...novel.chapters.map((c) => c.coverImagePath),
    ...novel.chapters.flatMap((c) => c.images.map((i) => i.storagePath)),
  ].filter((p): p is string => Boolean(p));

  await prisma.novel.delete({ where: { id: novelId } });
  await Promise.all(paths.map((path) => deleteImageFile(path)));
}

export async function hardDeleteChapter(chapterId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { images: true },
  });
  if (!chapter) return;

  const paths = [chapter.coverImagePath, ...chapter.images.map((i) => i.storagePath)].filter(
    (p): p is string => Boolean(p),
  );

  await prisma.chapter.delete({ where: { id: chapterId } });
  await Promise.all(paths.map((path) => deleteImageFile(path)));
}

/**
 * No cron job available, so this runs lazily whenever an admin visits the
 * panel (see admin (shell) layout) instead of on a schedule.
 */
export async function purgeExpiredTrash() {
  const cutoff = new Date(Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const expiredNovels = await prisma.novel.findMany({
    where: { deletedAt: { lt: cutoff } },
    select: { id: true },
  });
  for (const novel of expiredNovels) {
    await hardDeleteNovel(novel.id);
  }

  // Re-queried after the novel purge above, so chapters already removed via
  // cascade (their novel was just hard-deleted) are naturally excluded.
  const expiredChapters = await prisma.chapter.findMany({
    where: { deletedAt: { lt: cutoff } },
    select: { id: true },
  });
  for (const chapter of expiredChapters) {
    await hardDeleteChapter(chapter.id);
  }
}
