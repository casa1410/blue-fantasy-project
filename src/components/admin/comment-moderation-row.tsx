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
    <li className="space-y-2 rounded-md border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">
          {comment.authorName} <span className="text-gray-400">({comment.authorEmail})</span>
        </p>
        <p className="text-xs text-gray-400">
          {new Date(comment.createdAt).toLocaleString()}
        </p>
      </div>
      <p className="text-xs text-gray-500">
        {comment.novelTitle} · {comment.chapterTitle}
      </p>
      <p className="whitespace-pre-wrap text-sm text-gray-700">{comment.body}</p>
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => handleAction("APPROVED")}
          disabled={pending !== null}
          className="text-sm font-medium text-green-700 underline disabled:opacity-50"
        >
          {pending === "APPROVED" ? "..." : "Aprobar"}
        </button>
        <button
          type="button"
          onClick={() => handleAction("REJECTED")}
          disabled={pending !== null}
          className="text-sm font-medium text-gray-600 underline disabled:opacity-50"
        >
          {pending === "REJECTED" ? "..." : "Rechazar"}
        </button>
        <button
          type="button"
          onClick={() => handleAction("SPAM")}
          disabled={pending !== null}
          className="text-sm font-medium text-red-600 underline disabled:opacity-50"
        >
          {pending === "SPAM" ? "..." : "Marcar spam"}
        </button>
      </div>
    </li>
  );
}
