"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { removeChapterCover, uploadChapterCover } from "@/actions/chapters";

export function ChapterCoverUpload({
  novelId,
  chapterId,
  currentUrl,
}: {
  novelId: string;
  chapterId: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await uploadChapterCover(novelId, chapterId, formData);
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo la portada.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setLoading(true);
    setError(null);
    try {
      await removeChapterCover(novelId, chapterId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error quitando la portada.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 rounded-md border border-gray-200 p-4">
      <p className="text-sm font-medium text-gray-700">
        Portada del capitulo (opcional)
      </p>
      <p className="text-xs text-gray-500">
        Si no le pones una, en el inicio del sitio se muestra la portada de la novela.
      </p>

      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl} alt="Portada del capitulo" className="h-32 w-24 rounded object-cover" />
      )}

      <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-center gap-3">
        <input type="file" name="file" accept="image/*" required className="text-sm" />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Subiendo..." : currentUrl ? "Reemplazar" : "Subir portada"}
        </button>
        {currentUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="text-sm font-medium text-red-600 underline disabled:opacity-50"
          >
            Quitar
          </button>
        )}
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
