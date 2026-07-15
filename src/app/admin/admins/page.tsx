import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { AdminList } from "@/components/admin/admin-list";

export default async function AdminAdminsPage() {
  const user = await requireAdminUser();

  const admins = await prisma.adminProfile.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Administradores</h1>
      <p className="mt-1 text-sm text-gray-500">
        Debe haber siempre al menos 2 administradores, para que si uno pierde acceso, el otro
        pueda ayudarlo a recuperarlo.
      </p>

      <div className="mt-8">
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
