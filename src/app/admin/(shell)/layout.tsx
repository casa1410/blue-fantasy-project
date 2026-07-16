import { requireAdminUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminUser();

  return <AdminShell userEmail={user.email ?? ""}>{children}</AdminShell>;
}
