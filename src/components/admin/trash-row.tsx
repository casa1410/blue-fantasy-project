"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { restoreNovel, deleteNovelForever } from "@/actions/novels";
import { restoreChapter, deleteChapterForever } from "@/actions/chapters";

type Props =
  | { kind: "novel"; id: string; title: string; subtitle: string; daysLeft: number }
  | {
      kind: "chapter";
      id: string;
      novelId: string;
      title: string;
      subtitle: string;
      daysLeft: number;
    };

export function TrashRow(props: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"restore" | "delete" | null>(null);

  async function handleRestore() {
    setLoading("restore");
    if (props.kind === "novel") {
      await restoreNovel(props.id);
    } else {
      await restoreChapter(props.novelId, props.id);
    }
    router.refresh();
    setLoading(null);
  }

  async function handleDeleteForever() {
    if (!confirm(`Borrar "${props.title}" para siempre? Esta accion no se puede deshacer.`)) {
      return;
    }
    setLoading("delete");
    if (props.kind === "novel") {
      await deleteNovelForever(props.id);
    } else {
      await deleteChapterForever(props.id);
    }
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="admin-row">
      <div>
        <p className="font-medium">{props.title}</p>
        <p className="mt-1 text-sm text-(--admin-ink-faint)">
          {props.subtitle} · se borra en {props.daysLeft} dia(s)
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleRestore}
          disabled={loading !== null}
          className="admin-link disabled:opacity-30"
        >
          {loading === "restore" ? "Restaurando..." : "Restaurar"}
        </button>
        <button
          type="button"
          onClick={handleDeleteForever}
          disabled={loading !== null}
          className="btn-admin-ghost-danger disabled:opacity-30"
        >
          {loading === "delete" ? "Borrando..." : "Borrar definitivamente"}
        </button>
      </div>
    </div>
  );
}
