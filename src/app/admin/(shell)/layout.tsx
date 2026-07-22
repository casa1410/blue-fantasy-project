import { requireAdminUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { purgeExpiredTrash } from "@/lib/trash";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminUser();

  // No cron available, so trash past its retention window gets purged
  // lazily whenever an admin opens the panel.
  await purgeExpiredTrash();

  return <AdminShell userEmail={user.email ?? ""}>{children}</AdminShell>;
}
