"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createChapter } from "@/actions/chapters";

export function ChapterQuickCreateForm({ novelId }: { novelId: string }) {
  const router = useRouter();
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
        className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Creando..." : "Crear capitulo"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
