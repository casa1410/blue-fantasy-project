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
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">
          Titulo
        </label>
        <input
          id="title"
          {...register("title")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="synopsis" className="text-sm font-medium text-gray-700">
          Sinopsis
        </label>
        <textarea
          id="synopsis"
          rows={5}
          {...register("synopsis")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors.synopsis && (
          <p className="text-sm text-red-600">{errors.synopsis.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="genre" className="text-sm font-medium text-gray-700">
            Genero
          </label>
          <input
            id="genre"
            {...register("genre")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="status"
            {...register("status")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicada</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="tags" className="text-sm font-medium text-gray-700">
          Etiquetas (separadas por coma)
        </label>
        <input
          id="tags"
          {...register("tags")}
          placeholder="fantasia, romance, aventura"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
