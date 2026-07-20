"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateChapter, deleteChapter } from "@/actions/chapters";
import { ChapterEditor } from "@/components/admin/chapter-editor";

type Props = {
  novelId: string;
  chapter: {
    id: string;
    title: string;
    content: string;
    footer: string | null;
    status: "DRAFT" | "PUBLISHED";
  };
};

export function ChapterEditForm({ novelId, chapter }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState(chapter.content);
  const [footer, setFooter] = useState(chapter.footer ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(chapter.status);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateChapter(novelId, chapter.id, { title, content, footer, status });
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="admin-input sm:max-w-md"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
          className="admin-select sm:w-auto"
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

      <div>
        <label htmlFor="footer" className="admin-label">
          Pie de pagina (opcional)
        </label>
        <p className="mb-2 text-sm text-(--admin-ink-faint)">
          Referencias, notas del autor u otra info extra. Se muestra al final del capitulo.
        </p>
        <textarea
          id="footer"
          rows={4}
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          className="admin-textarea"
        />
      </div>

      {error && <p className="text-sm text-(--admin-danger)">{error}</p>}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className="btn-admin-primary">
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="btn-admin-ghost-danger"
        >
          {deleting ? "Borrando..." : "Borrar capitulo"}
        </button>
      </div>
    </form>
  );
}
