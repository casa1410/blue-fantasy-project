"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const invalidLinkMessage =
      "El link de invitación no es válido o ya expiró. Pide que te reenvíen la invitación.";

    // Supabase redirects recovery/invite links with the result in the URL
    // *hash* (e.g. #access_token=... on success, or #error=... on failure),
    // not as a query string, so it never reaches the server.
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    if (hashParams.get("error")) {
      // window.location must be read client-side only (avoids a hydration
      // mismatch vs. the server-rendered loading state), so these can't move
      // out of the effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(invalidLinkMessage);
      setReady(true);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let settled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !settled) {
        settled = true;
        setReady(true);
      }
    });

    // Fallback in case the hash didn't contain a session and no auth event fires.
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        setError(invalidLinkMessage);
        setReady(true);
      }
    }, 2500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  if (!ready) {
    return (
      <div className="admin-shell items-center justify-center">
        <p className="text-sm text-(--admin-ink-faint)">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="admin-shell items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="admin-card w-full max-w-sm space-y-4 shadow-sm">
        <p className="font-display text-xl text-(--admin-ink)">Define tu contraseña</p>

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

        <button type="submit" disabled={loading} className="btn-admin-primary w-full">
          {loading ? "Guardando..." : "Guardar y entrar"}
        </button>
      </form>
    </div>
  );
}
