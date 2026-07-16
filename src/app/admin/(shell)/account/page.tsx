"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AccountPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setPassword("");
    setConfirm("");
    setSuccess(true);
  }

  return (
    <div>
      <h1 className="admin-page-title">Mi cuenta</h1>
      <p className="admin-page-sub">Cambia tu contraseña de administrador.</p>

      <form onSubmit={handleSubmit} className="admin-card mt-8 max-w-md space-y-4">
        <div>
          <label htmlFor="password" className="admin-label">
            Nueva contraseña
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

        <div>
          <label htmlFor="confirm" className="admin-label">
            Confirmar contraseña
          </label>
          <input
            id="confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="admin-input"
          />
        </div>

        {error && <p className="text-sm text-(--admin-danger)">{error}</p>}
        {success && <p className="text-sm text-(--admin-success)">Contraseña actualizada.</p>}

        <button type="submit" disabled={loading} className="btn-admin-primary">
          {loading ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>
    </div>
  );
}
