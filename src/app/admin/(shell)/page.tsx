import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [novelCount, publishedCount, chapterCount, pendingComments, adminCount, trashCount] =
    await Promise.all([
      prisma.novel.count({ where: { deletedAt: null } }),
      prisma.novel.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      prisma.chapter.count({ where: { deletedAt: null } }),
      prisma.comment.count({ where: { status: "PENDING" } }),
      prisma.adminProfile.count(),
      Promise.all([
        prisma.novel.count({ where: { deletedAt: { not: null } } }),
        prisma.chapter.count({ where: { deletedAt: { not: null } } }),
      ]).then(([novels, chapters]) => novels + chapters),
    ]);

  const stats = [
    { label: "Novelas", value: novelCount, sub: `${publishedCount} publicadas`, href: "/admin/novels" },
    { label: "Capitulos", value: chapterCount, sub: "en total", href: "/admin/novels" },
    {
      label: "Comentarios pendientes",
      value: pendingComments,
      sub: "por revisar",
      href: "/admin/comments",
      highlight: pendingComments > 0,
    },
    { label: "Administradores", value: adminCount, sub: "con acceso", href: "/admin/admins" },
    { label: "Papelera", value: trashCount, sub: "por vencer en 30 dias", href: "/admin/trash" },
  ];

  return (
    <div>
      <h1 className="admin-page-title">Resumen</h1>
      <p className="admin-page-sub">Panorama general de BlueFantasyProject.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="admin-card block transition hover:border-(--admin-accent)">
            <p className="admin-label">{stat.label}</p>
            <p
              className="mt-1 text-3xl font-semibold"
              style={{ color: stat.highlight ? "var(--admin-warn)" : "var(--admin-ink)" }}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-(--admin-ink-faint)">{stat.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/admin/novels/new" className="btn-admin-primary">
          + Nueva novela
        </Link>
        <Link href="/admin/comments" className="btn-admin-secondary">
          Revisar comentarios
        </Link>
      </div>
    </div>
  );
}
