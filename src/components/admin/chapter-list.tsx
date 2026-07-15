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

  return (
    <ul className="divide-y divide-gray-200 border-t border-gray-200">
      {chapters.length === 0 && (
        <li className="py-6 text-sm text-gray-500">Todavia no hay capitulos.</li>
      )}
      {chapters.map((chapter, index) => (
        <li key={chapter.id} className="flex items-center justify-between py-4">
          <div>
            <p className="font-medium text-gray-900">{chapter.title}</p>
            <p className="text-sm text-gray-500">
              {chapter.status === "PUBLISHED" ? "Publicado" : "Borrador"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleMove(chapter.id, "up")}
              disabled={index === 0 || pendingId === chapter.id}
              className="text-sm text-gray-500 disabled:opacity-30"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => handleMove(chapter.id, "down")}
              disabled={index === chapters.length - 1 || pendingId === chapter.id}
              className="text-sm text-gray-500 disabled:opacity-30"
            >
              ▼
            </button>
            <Link
              href={`/admin/novels/${novelId}/chapters/${chapter.id}/edit`}
              className="text-sm font-medium text-gray-700 underline"
            >
              Editar
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
