"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteReferenceImage, uploadReferenceImage } from "@/actions/images";
import { validateImageFile } from "@/lib/image-constraints";

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
    const file = formData.get("file") as File | null;
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) {
        alert(validationError);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      await uploadReferenceImage(novelId, formData);
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error subiendo la imagen. Si el archivo es grande, prueba con uno mas liviano.",
      );
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
      <p className="admin-label">Imagenes de referencia</p>

      <form ref={formRef} action={handleUpload} className="flex flex-wrap items-center gap-3">
        <input type="file" name="file" accept="image/*" required className="text-sm text-(--admin-ink-soft)" />
        <input
          type="text"
          name="altText"
          placeholder="Descripcion (opcional)"
          className="admin-input w-auto"
        />
        <button type="submit" disabled={loading} className="btn-admin-secondary">
          {loading ? "Subiendo..." : "Agregar imagen"}
        </button>
      </form>
      {error && <p className="text-sm text-(--admin-danger)">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((image) => (
          <div key={image.id} className="space-y-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.altText ?? ""}
              className="h-32 w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => handleDelete(image.id)}
              disabled={deletingId === image.id}
              className="btn-admin-ghost-danger text-xs"
            >
              {deletingId === image.id ? "Borrando..." : "Borrar"}
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <p className="admin-empty col-span-3">Sin imagenes todavia.</p>
        )}
      </div>
    </div>
  );
}
