"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { hardDeleteNovel } from "@/lib/trash";
import { novelSchema, type NovelFormValues } from "@/lib/validation/novel";

function parseTags(tags: string | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

async function uniqueNovelSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || "novela";
  let slug = base;
  let n = 1;
  while (
    await prisma.novel.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function createNovel(values: NovelFormValues) {
  await requireAdminUser();
  const data = novelSchema.parse(values);
  const slug = await uniqueNovelSlug(data.title);

  const novel = await prisma.novel.create({
    data: {
      title: data.title,
      synopsis: data.synopsis,
      genre: data.genre || null,
      tags: parseTags(data.tags),
      status: data.status,
      slug,
    },
  });

  revalidatePath("/admin/novels");
  return { id: novel.id };
}

export async function updateNovel(id: string, values: NovelFormValues) {
  await requireAdminUser();
  const data = novelSchema.parse(values);

  const existing = await prisma.novel.findUniqueOrThrow({ where: { id } });
  const slug =
    existing.title === data.title ? existing.slug : await uniqueNovelSlug(data.title, id);

  await prisma.novel.update({
    where: { id },
    data: {
      title: data.title,
      synopsis: data.synopsis,
      genre: data.genre || null,
      tags: parseTags(data.tags),
      status: data.status,
      slug,
    },
  });

  revalidatePath("/admin/novels");
  revalidatePath(`/admin/novels/${id}/edit`);
}

export async function deleteNovel(id: string) {
  await requireAdminUser();
  await prisma.novel.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/novels");
  revalidatePath("/admin/trash");
}

export async function restoreNovel(id: string) {
  await requireAdminUser();
  await prisma.novel.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath("/admin/novels");
  revalidatePath("/admin/trash");
}

export async function deleteNovelForever(id: string) {
  await requireAdminUser();
  await hardDeleteNovel(id);
  revalidatePath("/admin/trash");
}
