import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { adminUpdateUser, adminDeleteUser } from "@/app/actions/admin";
import AdminCreateUser from "@/components/AdminCreateUser";
import ConfirmButton from "@/components/ConfirmButton";

export default async function AdminUsersPage() {
  const me = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { username: "asc" }],
    include: { _count: { select: { lists: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Utilisateurs</h1>
        <Link href="/admin" className="btn-secondary">
          ← Validation des éléments
        </Link>
      </div>

      <AdminCreateUser />

      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="card space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {u.username}
                  {u.role === "ADMIN" && (
                    <span className="badge ml-2">Admin</span>
                  )}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {u._count.lists} liste(s)
                  {u.id === me.id ? " · c'est toi" : ""}
                </p>
              </div>
              {u.id !== me.id && (
                <form action={adminDeleteUser}>
                  <input type="hidden" name="userId" value={u.id} />
                  <ConfirmButton
                    confirmLabel={`Supprimer le compte "${u.username}" ?`}
                  >
                    Supprimer le compte
                  </ConfirmButton>
                </form>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Changement de rôle */}
              <form action={adminUpdateUser} className="flex items-end gap-2">
                <input type="hidden" name="userId" value={u.id} />
                <div className="flex-1">
                  <label className="label">Rôle</label>
                  <select name="role" defaultValue={u.role} className="input">
                    <option value="USER">Utilisateur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
                <button type="submit" className="btn-secondary">
                  Enregistrer
                </button>
              </form>

              {/* Réinitialisation du mot de passe (avec confirmation) */}
              <form action={adminUpdateUser} className="flex items-end gap-2">
                <input type="hidden" name="userId" value={u.id} />
                <div className="flex-1">
                  <label className="label">Nouveau mot de passe</label>
                  <input
                    name="newPassword"
                    type="text"
                    className="input"
                    placeholder="(min. 6 caractères)"
                  />
                </div>
                <ConfirmButton
                  confirmLabel="Réinitialiser le mot de passe ?"
                  yesLabel="Oui, réinitialiser"
                  className="btn-secondary text-sm"
                >
                  Réinitialiser
                </ConfirmButton>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
