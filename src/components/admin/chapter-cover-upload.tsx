"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { removeChapterCover, uploadChapterCover } from "@/actions/chapters";
import { validateImageFile } from "@/lib/image-constraints";

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
    const file = formData.get("file") as File | null;
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      await uploadChapterCover(novelId, chapterId, formData);
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error subiendo la portada. Si el archivo es grande, prueba con uno mas liviano.",
      );
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
    <div className="space-y-3">
      <div>
        <p className="admin-label">Portada del capitulo (opcional)</p>
        <p className="text-sm text-(--admin-ink-faint)">
          Si no le pones una, en el inicio del sitio se muestra la portada de la novela.
        </p>
      </div>

      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl}
          alt="Portada del capitulo"
          className="h-32 w-24 rounded-lg object-cover"
        />
      )}

      <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-center gap-3">
        <input type="file" name="file" accept="image/*" required className="text-sm text-(--admin-ink-soft)" />
        <button type="submit" disabled={loading} className="btn-admin-secondary">
          {loading ? "Subiendo..." : currentUrl ? "Reemplazar" : "Subir portada"}
        </button>
        {currentUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="btn-admin-ghost-danger"
          >
            Quitar
          </button>
        )}
      </form>
      {error && <p className="text-sm text-(--admin-danger)">{error}</p>}
    </div>
  );
}
