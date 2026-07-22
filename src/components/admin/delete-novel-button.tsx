"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteNovel } from "@/actions/novels";

export function DeleteNovelButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Borrar "${title}" y todos sus capitulos e imagenes? Se enviara a la papelera y podras recuperarla dentro de los proximos 30 dias.`)) {
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
      className="btn-admin-ghost-danger disabled:opacity-50"
    >
      {loading ? "Borrando..." : "Borrar novela"}
    </button>
  );
}
