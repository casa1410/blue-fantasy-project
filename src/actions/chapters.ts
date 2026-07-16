"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { deleteImageFile, uploadImageFile, validateImageFile } from "@/lib/storage";
import { chapterSchema, type ChapterFormValues } from "@/lib/validation/chapter";

async function uniqueChapterSlug(
  novelId: string,
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title) || "capitulo";
  let slug = base;
  let n = 1;
  while (
    await prisma.chapter.findFirst({
      where: { novelId, slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function createChapter(novelId: string, values: ChapterFormValues) {
  await requireAdminUser();
  const data = chapterSchema.parse(values);
  const slug = await uniqueChapterSlug(novelId, data.title);

  const last = await prisma.chapter.findFirst({
    where: { novelId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const chapter = await prisma.chapter.create({
    data: {
      novelId,
      title: data.title,
      content: data.content,
      status: data.status,
      slug,
      order: (last?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/admin/novels/${novelId}/chapters`);
  return { id: chapter.id };
}

export async function updateChapter(
  novelId: string,
  chapterId: string,
  values: ChapterFormValues,
) {
  await requireAdminUser();
  const data = chapterSchema.parse(values);

  const existing = await prisma.chapter.findUniqueOrThrow({ where: { id: chapterId } });
  const slug =
    existing.title === data.title
      ? existing.slug
      : await uniqueChapterSlug(novelId, data.title, chapterId);

  await prisma.chapter.update({
    where: { id: chapterId },
    data: { title: data.title, content: data.content, status: data.status, slug },
  });

  revalidatePath(`/admin/novels/${novelId}/chapters`);
  revalidatePath(`/admin/novels/${novelId}/chapters/${chapterId}/edit`);
}

export async function deleteChapter(novelId: string, chapterId: string) {
  await requireAdminUser();

  const chapter = await prisma.chapter.findUniqueOrThrow({
    where: { id: chapterId },
    include: { images: true },
  });

  const paths = [chapter.coverImagePath, ...chapter.images.map((i) => i.storagePath)].filter(
    (p): p is string => Boolean(p),
  );

  await prisma.chapter.delete({ where: { id: chapterId } });
  await Promise.all(paths.map((path) => deleteImageFile(path)));

  revalidatePath(`/admin/novels/${novelId}/chapters`);
}

export async function moveChapter(
  novelId: string,
  chapterId: string,
  direction: "up" | "down",
) {
  await requireAdminUser();

  const chapters = await prisma.chapter.findMany({
    where: { novelId },
    orderBy: { order: "asc" },
  });

  const index = chapters.findIndex((c) => c.id === chapterId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= chapters.length) return;

  const a = chapters[index];
  const b = chapters[swapWith];

  await prisma.$transaction([
    prisma.chapter.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.chapter.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath(`/admin/novels/${novelId}/chapters`);
}

export async function uploadChapterInlineImage(
  novelId: string,
  chapterId: string,
  formData: FormData,
) {
  await requireAdminUser();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No se selecciono ningun archivo.");

  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const { url, path } = await uploadImageFile(file, `novels/${novelId}/chapters/${chapterId}`);
  await prisma.image.create({ data: { chapterId, url, storagePath: path } });

  return { url };
}

export async function uploadChapterCover(
  novelId: string,
  chapterId: string,
  formData: FormData,
) {
  await requireAdminUser();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No se selecciono ningun archivo.");

  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const chapter = await prisma.chapter.findUniqueOrThrow({ where: { id: chapterId } });
  const { url, path } = await uploadImageFile(file, `novels/${novelId}/chapters/${chapterId}/cover`);

  await prisma.chapter.update({
    where: { id: chapterId },
    data: { coverImageUrl: url, coverImagePath: path },
  });

  if (chapter.coverImagePath) {
    await deleteImageFile(chapter.coverImagePath);
  }

  revalidatePath(`/admin/novels/${novelId}/chapters/${chapterId}/edit`);
  revalidatePath("/");
}

export async function removeChapterCover(novelId: string, chapterId: string) {
  await requireAdminUser();
  const chapter = await prisma.chapter.findUniqueOrThrow({ where: { id: chapterId } });

  await prisma.chapter.update({
    where: { id: chapterId },
    data: { coverImageUrl: null, coverImagePath: null },
  });

  if (chapter.coverImagePath) {
    await deleteImageFile(chapter.coverImagePath);
  }

  revalidatePath(`/admin/novels/${novelId}/chapters/${chapterId}/edit`);
  revalidatePath("/");
}
