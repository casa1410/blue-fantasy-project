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
      <h2 className="text-lg font-medium text-gray-900">Portada</h2>
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl} alt="Portada actual" className="h-48 w-32 rounded object-cover" />
      )}
      <form ref={formRef} action={handleSubmit} className="flex items-center gap-3">
        <input type="file" name="file" accept="image/*" required className="text-sm" />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Subiendo..." : "Subir portada"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
