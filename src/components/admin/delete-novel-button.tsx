"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteNovel } from "@/actions/novels";

export function DeleteNovelButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Borrar "${title}" y todos sus capitulos e imagenes? Esta accion no se puede deshacer.`)) {
      return;
    }
    setLoading(true);
    await deleteNovel(id);
    router.push("/admin/novels");
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-red-600 underline disabled:opacity-50"
    >
      {loading ? "Borrando..." : "Borrar novela"}
    </button>
  );
}
