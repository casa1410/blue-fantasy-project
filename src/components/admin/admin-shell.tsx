"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";

const STORAGE_KEY = "admin-theme";

export function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    // localStorage/matchMedia must be read client-side only (avoids a
    // hydration mismatch vs. the server-rendered theme-less markup).
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  return (
    <div className="admin-shell" data-theme={theme ?? undefined}>
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-sidebar-logo">
          BlueFantasyProject
        </Link>
        <AdminNav />
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {theme === "dark" ? "☀" : "🌙"}
          </button>
          <span className="admin-topbar-email">{userEmail}</span>
          <LogoutButton />
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
