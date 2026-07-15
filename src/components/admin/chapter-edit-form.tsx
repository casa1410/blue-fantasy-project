"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateChapter, deleteChapter } from "@/actions/chapters";
import { ChapterEditor } from "@/components/admin/chapter-editor";

type Props = {
  novelId: string;
  chapter: { id: string; title: string; content: string; status: "DRAFT" | "PUBLISHED" };
};

export function ChapterEditForm({ novelId, chapter }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState(chapter.content);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(chapter.status);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateChapter(novelId, chapter.id, { title, content, status });
      router.refresh();
    } catch {
      setError("Ocurrio un error guardando el capitulo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Borrar el capitulo "${title}"? Esta accion no se puede deshacer.`)) return;
    setDeleting(true);
    await deleteChapter(novelId, chapter.id);
    router.push(`/admin/novels/${novelId}/chapters`);
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="DRAFT">Borrador</option>
          <option value="PUBLISHED">Publicado</option>
        </select>
      </div>

      <ChapterEditor
        novelId={novelId}
        chapterId={chapter.id}
        initialContent={content}
        onChange={setContent}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm font-medium text-red-600 underline disabled:opacity-50"
        >
          {deleting ? "Borrando..." : "Borrar capitulo"}
        </button>
      </div>
    </form>
  );
}
