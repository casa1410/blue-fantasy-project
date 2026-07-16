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
    <div>
      <h1 className="admin-page-title">Comentarios</h1>
      <p className="admin-page-sub">Modera lo que se publica en el sitio.</p>

      <div className="mt-6 flex gap-2 border-b border-(--admin-border)">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/comments?status=${tab.value}`}
            className={`border-b-2 px-3 pb-3 text-sm font-medium ${
              activeStatus === tab.value
                ? "border-(--admin-accent) text-(--admin-accent)"
                : "border-transparent text-(--admin-ink-faint) hover:text-(--admin-ink)"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-3">
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
          <p className="admin-empty">No hay comentarios en esta categoria.</p>
        )}
      </div>
    </div>
  );
}
