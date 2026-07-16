"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteAdmin, removeAdmin } from "@/actions/admins";

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
  const [error, setError] = useState<string | null>(null);
  const [invited, setInvited] = useState<{ email: string; tempPassword: string } | null>(null);

  const canRemove = admins.length > 2;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setError(null);
    setInvited(null);
    try {
      const { tempPassword } = await inviteAdmin(email);
      setInvited({ email, tempPassword });
      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error invitando administrador.");
    } finally {
      setInviting(false);
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

      {invited && (
        <div className="admin-callout">
          <p>
            Se envio una invitacion por correo a <strong>{invited.email}</strong>, pero esos links
            a veces no llegan a funcionar (Gmail los puede invalidar antes de que se abran).
            Comparte esta contrasena temporal directamente como respaldo:
          </p>
          <p className="mt-2 font-mono text-base text-(--admin-ink)">{invited.tempPassword}</p>
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
            <button
              type="button"
              onClick={() => handleRemove(admin.id, admin.email)}
              disabled={!canRemove || admin.id === currentUserId || removingId === admin.id}
              className="btn-admin-ghost-danger disabled:opacity-30"
            >
              {removingId === admin.id ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
