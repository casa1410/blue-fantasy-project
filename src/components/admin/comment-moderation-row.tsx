"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCommentStatus, replyToComment } from "@/actions/comments";
import type { CommentStatus } from "@/generated/prisma/enums";

type Reply = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

type CommentItem = {
  id: string;
  authorName: string;
  authorEmail: string;
  body: string;
  createdAt: string;
  chapterTitle: string;
  novelTitle: string;
  replies: Reply[];
};

const DEFAULT_REPLY_AUTHOR = "ElFrikiSac";

export function CommentModerationRow({ comment }: { comment: CommentItem }) {
  const router = useRouter();
  const [pending, setPending] = useState<CommentStatus | null>(null);
  const [replying, setReplying] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyAuthor, setReplyAuthor] = useState(DEFAULT_REPLY_AUTHOR);
  const [replyBody, setReplyBody] = useState("");

  async function handleAction(status: CommentStatus) {
    setPending(status);
    await updateCommentStatus(comment.id, status);
    router.refresh();
    setPending(null);
  }

  async function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    setSendingReply(true);
    await replyToComment(comment.id, replyAuthor, replyBody);
    setReplyBody("");
    setReplying(false);
    router.refresh();
    setSendingReply(false);
  }

  async function handleDeleteReply(replyId: string) {
    setPending("REJECTED");
    await updateCommentStatus(replyId, "REJECTED");
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

      {comment.replies.length > 0 && (
        <div className="ml-4 space-y-2 border-l-2 border-(--admin-border) pl-4">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-(--admin-accent)">
                  {reply.authorName} · Autor
                </p>
                <p className="text-xs text-(--admin-ink-faint)">
                  {new Date(reply.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="text-sm whitespace-pre-wrap text-(--admin-ink-soft)">{reply.body}</p>
              <button
                type="button"
                onClick={() => handleDeleteReply(reply.id)}
                disabled={pending !== null}
                className="text-xs text-(--admin-danger) hover:underline disabled:opacity-50"
              >
                Eliminar respuesta
              </button>
            </div>
          ))}
        </div>
      )}

      {replying && (
        <form onSubmit={handleReplySubmit} className="ml-4 space-y-2 border-l-2 border-(--admin-border) pl-4">
          <input
            type="text"
            value={replyAuthor}
            onChange={(e) => setReplyAuthor(e.target.value)}
            placeholder="Tu nombre"
            className="admin-input"
          />
          <textarea
            required
            rows={3}
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Escribe tu respuesta..."
            className="admin-textarea"
          />
          <div className="flex gap-3">
            <button type="submit" disabled={sendingReply} className="btn-admin-primary disabled:opacity-50">
              {sendingReply ? "Enviando..." : "Enviar respuesta"}
            </button>
            <button
              type="button"
              onClick={() => setReplying(false)}
              disabled={sendingReply}
              className="btn-admin-ghost disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-4 pt-1">
        {!replying && (
          <button
            type="button"
            onClick={() => setReplying(true)}
            disabled={pending !== null}
            className="text-sm font-medium text-(--admin-accent) hover:underline disabled:opacity-50"
          >
            Responder
          </button>
        )}
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
