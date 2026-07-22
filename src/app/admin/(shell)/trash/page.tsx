import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { TRASH_RETENTION_DAYS } from "@/lib/trash";
import { TrashRow } from "@/components/admin/trash-row";

function daysLeft(deletedAt: Date): number {
  const elapsedMs = Date.now() - deletedAt.getTime();
  const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
  return Math.max(0, TRASH_RETENTION_DAYS - elapsedDays);
}

export default async function TrashPage() {
  await requireAdminUser();

  const [novels, chapters] = await Promise.all([
    prisma.novel.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.chapter.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      include: { novel: { select: { title: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="admin-page-title">Papelera</h1>
      <p className="admin-page-sub">
        Lo que borres queda aqui {TRASH_RETENTION_DAYS} dias antes de eliminarse para siempre.
      </p>

      <div className="admin-card mt-8">
        <p className="admin-label">Novelas</p>
        <div className="mt-3">
          {novels.length === 0 && <p className="admin-empty">Sin novelas en la papelera.</p>}
          {novels.map((novel) => (
            <TrashRow
              key={novel.id}
              kind="novel"
              id={novel.id}
              title={novel.title}
              subtitle="Novela"
              daysLeft={daysLeft(novel.deletedAt!)}
            />
          ))}
        </div>
      </div>

      <div className="admin-card mt-6">
        <p className="admin-label">Capitulos</p>
        <div className="mt-3">
          {chapters.length === 0 && <p className="admin-empty">Sin capitulos en la papelera.</p>}
          {chapters.map((chapter) => (
            <TrashRow
              key={chapter.id}
              kind="chapter"
              id={chapter.id}
              novelId={chapter.novelId}
              title={chapter.title}
              subtitle={chapter.novel.title}
              daysLeft={daysLeft(chapter.deletedAt!)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
