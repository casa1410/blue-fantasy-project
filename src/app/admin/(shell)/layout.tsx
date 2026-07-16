import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminUser();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-sidebar-logo">
          BlueFantasyProject
        </Link>
        <AdminNav />
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <span className="admin-topbar-email">{user.email}</span>
          <LogoutButton />
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
