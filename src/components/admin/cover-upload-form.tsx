"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadNovelCover } from "@/actions/images";

export function CoverUploadForm({
  novelId,
  currentUrl,
}: {
  novelId: string;
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
      await uploadNovelCover(novelId, formData);
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo la portada.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="admin-label">Portada de la novela</p>
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl}
          alt="Portada actual"
          className="h-48 w-32 rounded-lg object-cover"
        />
      )}
      <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-center gap-3">
        <input type="file" name="file" accept="image/*" required className="text-sm text-(--admin-ink-soft)" />
        <button type="submit" disabled={loading} className="btn-admin-secondary">
          {loading ? "Subiendo..." : "Subir portada"}
        </button>
      </form>
      {error && <p className="text-sm text-(--admin-danger)">{error}</p>}
    </div>
  );
}
