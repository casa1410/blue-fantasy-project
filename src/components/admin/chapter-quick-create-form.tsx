"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createChapter, uploadChapterCover } from "@/actions/chapters";

export function ChapterQuickCreateForm({ novelId }: { novelId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const created = await createChapter(novelId, {
        title,
        content: "<p></p>",
        status: "DRAFT",
      });

      const coverFile = fileInputRef.current?.files?.[0];
      if (coverFile) {
        const formData = new FormData();
        formData.set("file", coverFile);
        await uploadChapterCover(novelId, created.id, formData);
      }

      router.push(`/admin/novels/${novelId}/chapters/${created.id}/edit`);
    } catch {
      setError("Ocurrio un error creando el capitulo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titulo del capitulo"
        className="admin-input max-w-sm"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        title="Portada del capitulo (opcional)"
        className="text-sm text-(--admin-ink-soft)"
      />
      <button type="submit" disabled={loading} className="btn-admin-primary">
        {loading ? "Creando..." : "Crear capitulo"}
      </button>
      {error && <p className="text-sm text-(--admin-danger)">{error}</p>}
    </form>
  );
}
