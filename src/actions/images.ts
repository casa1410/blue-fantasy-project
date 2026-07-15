"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { deleteImageFile, uploadImageFile, validateImageFile } from "@/lib/storage";

export async function uploadNovelCover(novelId: string, formData: FormData) {
  await requireAdminUser();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No se selecciono ningun archivo.");

  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const novel = await prisma.novel.findUniqueOrThrow({ where: { id: novelId } });
  const { url, path } = await uploadImageFile(file, `novels/${novelId}/cover`);

  await prisma.novel.update({
    where: { id: novelId },
    data: { coverImageUrl: url, coverImagePath: path },
  });

  if (novel.coverImagePath) {
    await deleteImageFile(novel.coverImagePath);
  }

  revalidatePath(`/admin/novels/${novelId}/edit`);
  revalidatePath(`/admin/novels/${novelId}/images`);
}

export async function uploadReferenceImage(novelId: string, formData: FormData) {
  await requireAdminUser();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No se selecciono ningun archivo.");

  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const altText = (formData.get("altText") as string | null) || null;
  const { url, path } = await uploadImageFile(file, `novels/${novelId}/reference`);

  await prisma.image.create({
    data: { novelId, url, storagePath: path, altText },
  });

  revalidatePath(`/admin/novels/${novelId}/images`);
}

export async function deleteReferenceImage(imageId: string, novelId: string) {
  await requireAdminUser();
  const image = await prisma.image.findUniqueOrThrow({ where: { id: imageId } });
  await prisma.image.delete({ where: { id: imageId } });
  await deleteImageFile(image.storagePath);
  revalidatePath(`/admin/novels/${novelId}/images`);
}
