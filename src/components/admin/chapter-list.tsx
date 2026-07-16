"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { moveChapter } from "@/actions/chapters";

type ChapterItem = { id: string; title: string; status: "DRAFT" | "PUBLISHED" };

export function ChapterList({
  novelId,
  chapters,
}: {
  novelId: string;
  chapters: ChapterItem[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleMove(chapterId: string, direction: "up" | "down") {
    setPendingId(chapterId);
    await moveChapter(novelId, chapterId, direction);
    router.refresh();
    setPendingId(null);
  }

  if (chapters.length === 0) {
    return <p className="admin-empty">Todavia no hay capitulos.</p>;
  }

  return (
    <div>
      {chapters.map((chapter, index) => (
        <div key={chapter.id} className="admin-row">
          <div className="flex items-center gap-3">
            <span className="text-sm text-(--admin-ink-faint)">{index + 1}.</span>
            <div>
              <p className="font-medium">{chapter.title}</p>
              <span
                className={`badge mt-1 inline-flex ${chapter.status === "PUBLISHED" ? "badge-published" : "badge-draft"}`}
              >
                {chapter.status === "PUBLISHED" ? "Publicado" : "Borrador"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleMove(chapter.id, "up")}
              disabled={index === 0 || pendingId === chapter.id}
              className="btn-admin-ghost disabled:opacity-30"
              aria-label="Mover arriba"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => handleMove(chapter.id, "down")}
              disabled={index === chapters.length - 1 || pendingId === chapter.id}
              className="btn-admin-ghost disabled:opacity-30"
              aria-label="Mover abajo"
            >
              ▼
            </button>
            <Link
              href={`/admin/novels/${novelId}/chapters/${chapter.id}/edit`}
              className="admin-link"
            >
              Editar
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
