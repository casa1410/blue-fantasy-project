"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { novelSchema, type NovelFormValues } from "@/lib/validation/novel";
import { createNovel, updateNovel } from "@/actions/novels";

type Props = {
  novel?: {
    id: string;
    title: string;
    synopsis: string;
    genre: string | null;
    tags: string[];
    status: "DRAFT" | "PUBLISHED";
  };
};

export function NovelForm({ novel }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NovelFormValues>({
    resolver: zodResolver(novelSchema),
    defaultValues: novel
      ? {
          title: novel.title,
          synopsis: novel.synopsis,
          genre: novel.genre ?? "",
          tags: novel.tags.join(", "),
          status: novel.status,
        }
      : { title: "", synopsis: "", genre: "", tags: "", status: "DRAFT" },
  });

  async function onSubmit(values: NovelFormValues) {
    setServerError(null);
    try {
      if (novel) {
        await updateNovel(novel.id, values);
        router.refresh();
      } else {
        const created = await createNovel(values);
        router.push(`/admin/novels/${created.id}/edit`);
      }
    } catch {
      setServerError("Ocurrio un error guardando la novela.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="title" className="admin-label">
          Titulo
        </label>
        <input id="title" {...register("title")} className="admin-input" />
        {errors.title && (
          <p className="mt-1 text-sm text-(--admin-danger)">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="synopsis" className="admin-label">
          Sinopsis
        </label>
        <textarea
          id="synopsis"
          rows={5}
          {...register("synopsis")}
          className="admin-textarea"
        />
        {errors.synopsis && (
          <p className="mt-1 text-sm text-(--admin-danger)">{errors.synopsis.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="genre" className="admin-label">
            Genero
          </label>
          <input id="genre" {...register("genre")} className="admin-input" />
        </div>

        <div>
          <label htmlFor="status" className="admin-label">
            Estado
          </label>
          <select id="status" {...register("status")} className="admin-select">
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicada</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="tags" className="admin-label">
          Etiquetas (separadas por coma)
        </label>
        <input
          id="tags"
          {...register("tags")}
          placeholder="fantasia, romance, aventura"
          className="admin-input"
        />
      </div>

      {serverError && <p className="text-sm text-(--admin-danger)">{serverError}</p>}

      <button type="submit" disabled={isSubmitting} className="btn-admin-primary">
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
