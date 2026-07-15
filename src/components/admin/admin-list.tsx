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

  const canRemove = admins.length > 2;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setError(null);
    try {
      await inviteAdmin(email);
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
      <form onSubmit={handleInvite} className="flex items-center gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={inviting}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {inviting ? "Invitando..." : "Invitar administrador"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!canRemove && (
        <p className="text-sm text-amber-600">
          Debe haber al menos 2 administradores: no se puede eliminar ninguno hasta agregar otro.
        </p>
      )}

      <ul className="divide-y divide-gray-200 border-t border-gray-200">
        {admins.map((admin) => (
          <li key={admin.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-gray-900">
                {admin.email} {admin.id === currentUserId && "(tu)"}
              </p>
              <p className="text-sm text-gray-500">
                Desde {new Date(admin.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(admin.id, admin.email)}
              disabled={!canRemove || admin.id === currentUserId || removingId === admin.id}
              className="text-sm font-medium text-red-600 underline disabled:opacity-30"
            >
              {removingId === admin.id ? "Eliminando..." : "Eliminar"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
