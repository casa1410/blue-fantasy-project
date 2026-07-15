import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [novelCount, pendingComments] = await Promise.all([
    prisma.novel.count(),
    prisma.comment.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Panel de administración</h1>
      <p className="mt-2 text-gray-600">Sesión iniciada como {user?.email}.</p>

      <nav className="mt-8 flex gap-6">
        <Link href="/admin/novels" className="text-sm font-medium text-gray-700 underline">
          Novelas ({novelCount})
        </Link>
        <Link href="/admin/comments" className="text-sm font-medium text-gray-700 underline">
          Comentarios pendientes ({pendingComments})
        </Link>
        <Link href="/admin/admins" className="text-sm font-medium text-gray-700 underline">
          Administradores
        </Link>
      </nav>
    </div>
  );
}
