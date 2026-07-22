import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";

export default async function AdminNovelsPage() {
  await requireAdminUser();

  const novels = await prisma.novel.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { chapters: { where: { deletedAt: null } } } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Novelas</h1>
          <p className="admin-page-sub">{novels.length} en total.</p>
        </div>
        <Link href="/admin/novels/new" className="btn-admin-primary">
          + Nueva novela
        </Link>
      </div>

      <div className="admin-card mt-8">
        {novels.length === 0 && <p className="admin-empty">Todavia no hay novelas.</p>}
        {novels.map((novel) => (
          <div key={novel.id} className="admin-row">
            <div>
              <p className="font-medium">{novel.title}</p>
              <p className="mt-1 text-sm text-(--admin-ink-faint)">
                {novel._count.chapters} capitulo(s)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`badge ${novel.status === "PUBLISHED" ? "badge-published" : "badge-draft"}`}>
                {novel.status === "PUBLISHED" ? "Publicada" : "Borrador"}
              </span>
              <Link href={`/admin/novels/${novel.id}/edit`} className="admin-link">
                Editar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
