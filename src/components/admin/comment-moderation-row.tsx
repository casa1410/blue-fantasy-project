"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCommentStatus } from "@/actions/comments";
import type { CommentStatus } from "@/generated/prisma/enums";

type CommentItem = {
  id: string;
  authorName: string;
  authorEmail: string;
  body: string;
  createdAt: string;
  chapterTitle: string;
  novelTitle: string;
};

export function CommentModerationRow({ comment }: { comment: CommentItem }) {
  const router = useRouter();
  const [pending, setPending] = useState<CommentStatus | null>(null);

  async function handleAction(status: CommentStatus) {
    setPending(status);
    await updateCommentStatus(comment.id, status);
    router.refresh();
    setPending(null);
  }

  return (
    <div className="admin-card space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {comment.authorName}{" "}
          <span className="text-(--admin-ink-faint)">({comment.authorEmail})</span>
        </p>
        <p className="text-xs text-(--admin-ink-faint)">
          {new Date(comment.createdAt).toLocaleString()}
        </p>
      </div>
      <p className="text-xs text-(--admin-ink-faint)">
        {comment.novelTitle} · {comment.chapterTitle}
      </p>
      <p className="text-sm whitespace-pre-wrap text-(--admin-ink-soft)">{comment.body}</p>
      <div className="flex gap-4 pt-1">
        <button
          type="button"
          onClick={() => handleAction("APPROVED")}
          disabled={pending !== null}
          className="text-sm font-medium text-(--admin-success) hover:underline disabled:opacity-50"
        >
          {pending === "APPROVED" ? "..." : "Aprobar"}
        </button>
        <button
          type="button"
          onClick={() => handleAction("REJECTED")}
          disabled={pending !== null}
          className="btn-admin-ghost disabled:opacity-50"
        >
          {pending === "REJECTED" ? "..." : "Rechazar"}
        </button>
        <button
          type="button"
          onClick={() => handleAction("SPAM")}
          disabled={pending !== null}
          className="btn-admin-ghost-danger disabled:opacity-50"
        >
          {pending === "SPAM" ? "..." : "Marcar spam"}
        </button>
      </div>
    </div>
  );
}
