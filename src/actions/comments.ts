"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { getClientIpHash } from "@/lib/request-ip";
import { commentSchema } from "@/lib/validation/comment";
import type { CommentStatus } from "@/generated/prisma/enums";

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export type SubmitCommentResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitComment(
  chapterSlug: string,
  novelSlug: string,
  values: { authorName: string; authorEmail: string; body: string; honeypot: string },
): Promise<SubmitCommentResult> {
  // Bots that auto-fill every field trip the honeypot; pretend success so they
  // don't learn to avoid it, but never write the comment.
  if (values.honeypot) {
    return { ok: true };
  }

  const parsed = commentSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const chapter = await prisma.chapter.findFirst({
    where: {
      slug: chapterSlug,
      status: "PUBLISHED",
      deletedAt: null,
      novel: { slug: novelSlug, status: "PUBLISHED", deletedAt: null },
    },
    select: { id: true },
  });
  if (!chapter) {
    return { ok: false, error: "Capitulo no encontrado." };
  }

  const ipHash = await getClientIpHash();
  const recentCount = await prisma.comment.count({
    where: { ipHash, createdAt: { gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) } },
  });
  if (recentCount >= RATE_LIMIT_MAX) {
    return { ok: false, error: "Estas comentando muy seguido. Espera unos minutos e intenta de nuevo." };
  }

  await prisma.comment.create({
    data: {
      chapterId: chapter.id,
      authorName: parsed.data.authorName,
      authorEmail: parsed.data.authorEmail,
      body: parsed.data.body,
      ipHash,
      status: "PENDING",
    },
  });

  revalidatePath(`/novels/${novelSlug}/${chapterSlug}`);
  return { ok: true };
}

export async function updateCommentStatus(commentId: string, status: CommentStatus) {
  await requireAdminUser();
  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { status },
    include: { chapter: { include: { novel: true } } },
  });

  revalidatePath("/admin/comments");
  revalidatePath(`/novels/${comment.chapter.novel.slug}/${comment.chapter.slug}`);
}

export async function replyToComment(commentId: string, authorName: string, body: string) {
  const admin = await requireAdminUser();

  const parsedBody = body.trim();
  const parsedName = authorName.trim();
  if (!parsedBody || !parsedName) {
    throw new Error("El nombre y la respuesta son obligatorios.");
  }

  const parent = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId },
    include: { chapter: { include: { novel: true } } },
  });

  await prisma.comment.create({
    data: {
      chapterId: parent.chapterId,
      parentId: parent.id,
      authorName: parsedName,
      authorEmail: admin.email ?? "",
      body: parsedBody,
      status: "APPROVED",
      isAuthorReply: true,
    },
  });

  revalidatePath("/admin/comments");
  revalidatePath(`/novels/${parent.chapter.novel.slug}/${parent.chapter.slug}`);
}
