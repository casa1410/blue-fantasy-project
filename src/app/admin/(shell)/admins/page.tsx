import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { AdminList } from "@/components/admin/admin-list";

export default async function AdminAdminsPage() {
  const user = await requireAdminUser();

  const admins = await prisma.adminProfile.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="admin-page-title">Administradores</h1>
      <p className="admin-page-sub max-w-xl">
        Debe haber siempre al menos 2 administradores, para que si uno pierde acceso, el otro
        pueda ayudarlo a recuperarlo.
      </p>

      <div className="admin-card mt-8 max-w-2xl">
        <AdminList
          admins={admins.map((a) => ({
            id: a.id,
            email: a.email,
            createdAt: a.createdAt.toISOString(),
          }))}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
