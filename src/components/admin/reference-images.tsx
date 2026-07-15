"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteReferenceImage, uploadReferenceImage } from "@/actions/images";

type ImageItem = { id: string; url: string; altText: string | null };

export function ReferenceImages({
  novelId,
  images,
}: {
  novelId: string;
  images: ImageItem[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await uploadReferenceImage(novelId, formData);
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo la imagen.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Borrar esta imagen?")) return;
    setDeletingId(imageId);
    await deleteReferenceImage(imageId, novelId);
    router.refresh();
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Imagenes de referencia</h2>

      <form ref={formRef} action={handleUpload} className="flex flex-wrap items-center gap-3">
        <input type="file" name="file" accept="image/*" required className="text-sm" />
        <input
          type="text"
          name="altText"
          placeholder="Descripcion (opcional)"
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Subiendo..." : "Agregar imagen"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((image) => (
          <div key={image.id} className="space-y-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.altText ?? ""}
              className="h-32 w-full rounded object-cover"
            />
            <button
              type="button"
              onClick={() => handleDelete(image.id)}
              disabled={deletingId === image.id}
              className="text-xs font-medium text-red-600 underline disabled:opacity-50"
            >
              {deletingId === image.id ? "Borrando..." : "Borrar"}
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <p className="col-span-3 text-sm text-gray-500">Sin imagenes todavia.</p>
        )}
      </div>
    </div>
  );
}
