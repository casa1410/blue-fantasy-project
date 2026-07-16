"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="admin-shell items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="admin-card w-full max-w-sm space-y-4 shadow-sm"
      >
        <p className="font-display text-xl text-(--admin-ink)">BlueFantasyProject</p>
        <p className="text-sm text-(--admin-ink-faint)">Panel de administración</p>

        <div>
          <label htmlFor="email" className="admin-label">
            Correo
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="admin-input"
          />
        </div>

        <div>
          <label htmlFor="password" className="admin-label">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
          />
        </div>

        {error && <p className="text-sm text-(--admin-danger)">{error}</p>}

        <button type="submit" disabled={loading} className="btn-admin-primary w-full">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
