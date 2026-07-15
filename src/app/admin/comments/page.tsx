import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { CommentModerationRow } from "@/components/admin/comment-moderation-row";
import type { CommentStatus } from "@/generated/prisma/enums";

const TABS: { value: CommentStatus; label: string }[] = [
  { value: "PENDING", label: "Pendientes" },
  { value: "APPROVED", label: "Aprobados" },
  { value: "REJECTED", label: "Rechazados" },
  { value: "SPAM", label: "Spam" },
];

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminUser();
  const { status } = await searchParams;
  const activeStatus: CommentStatus = TABS.some((t) => t.value === status)
    ? (status as CommentStatus)
    : "PENDING";

  const comments = await prisma.comment.findMany({
    where: { status: activeStatus },
    orderBy: { createdAt: "desc" },
    include: { chapter: { include: { novel: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Comentarios</h1>

      <div className="mt-6 flex gap-4 border-b border-gray-200">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/comments?status=${tab.value}`}
            className={`pb-2 text-sm font-medium ${
              activeStatus === tab.value
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <ul className="mt-6 space-y-4">
        {comments.map((comment) => (
          <CommentModerationRow
            key={comment.id}
            comment={{
              id: comment.id,
              authorName: comment.authorName,
              authorEmail: comment.authorEmail,
              body: comment.body,
              createdAt: comment.createdAt.toISOString(),
              chapterTitle: comment.chapter.title,
              novelTitle: comment.chapter.novel.title,
            }}
          />
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-gray-500">No hay comentarios en esta categoria.</li>
        )}
      </ul>
    </div>
  );
}
