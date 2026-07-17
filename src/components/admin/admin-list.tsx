"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteAdmin, removeAdmin, resetAdminPassword } from "@/actions/admins";

type AdminItem = { id: string; email: string; createdAt: string };

export function AdminList({
  admins,
  currentUserId,
}: {
  admins: AdminItem[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<{ email: string; tempPassword: string } | null>(
    null,
  );

  const canRemove = admins.length > 2;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setError(null);
    setGenerated(null);
    try {
      const { tempPassword } = await inviteAdmin(email);
      setGenerated({ email, tempPassword });
      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error invitando administrador.");
    } finally {
      setInviting(false);
    }
  }

  async function handleReset(id: string, adminEmail: string) {
    if (!confirm(`Generar una nueva contrasena temporal para ${adminEmail}?`)) return;
    setResettingId(id);
    setError(null);
    setGenerated(null);
    try {
      const { tempPassword } = await resetAdminPassword(id);
      setGenerated({ email: adminEmail, tempPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error restableciendo contrasena.");
    } finally {
      setResettingId(null);
    }
  }

  async function handleRemove(id: string, adminEmail: string) {
    if (!confirm(`Eliminar a ${adminEmail} como administrador?`)) return;
    setRemovingId(id);
    setError(null);
    try {
      await removeAdmin(id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error eliminando administrador.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="admin-label">Invitar administrador</p>
        <form onSubmit={handleInvite} className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="admin-input max-w-sm"
          />
          <button type="submit" disabled={inviting} className="btn-admin-primary">
            {inviting ? "Invitando..." : "Invitar"}
          </button>
        </form>
      </div>

      {error && <p className="text-sm text-(--admin-danger)">{error}</p>}

      {generated && (
        <div className="admin-callout">
          <p>
            Contrasena temporal generada para <strong>{generated.email}</strong>. Comparteselo
            directamente (no depende de correo):
          </p>
          <p className="mt-2 font-mono text-base text-(--admin-ink)">{generated.tempPassword}</p>
          <p className="mt-2 text-xs">
            Puede iniciar sesion con esta contrasena y cambiarla luego desde &quot;Mi cuenta&quot;.
          </p>
        </div>
      )}

      {!canRemove && (
        <p className="admin-callout">
          Debe haber al menos 2 administradores: no se puede eliminar ninguno hasta agregar otro.
        </p>
      )}

      <div className="border-t border-(--admin-border)">
        {admins.map((admin) => (
          <div key={admin.id} className="admin-row">
            <div>
              <p className="font-medium">
                {admin.email} {admin.id === currentUserId && "(tu)"}
              </p>
              <p className="mt-1 text-sm text-(--admin-ink-faint)">
                Desde {new Date(admin.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {admin.id !== currentUserId && (
                <button
                  type="button"
                  onClick={() => handleReset(admin.id, admin.email)}
                  disabled={resettingId === admin.id}
                  className="admin-link disabled:opacity-30"
                >
                  {resettingId === admin.id ? "Generando..." : "Restablecer contrasena"}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(admin.id, admin.email)}
                disabled={!canRemove || admin.id === currentUserId || removingId === admin.id}
                className="btn-admin-ghost-danger disabled:opacity-30"
              >
                {removingId === admin.id ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
