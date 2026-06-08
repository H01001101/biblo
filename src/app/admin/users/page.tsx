import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { adminUpdateUser, adminDeleteUser } from "@/app/actions/admin";
import AdminCreateUser from "@/components/AdminCreateUser";

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
          <div key={u.id} className="card p-4">
            <form
              action={adminUpdateUser}
              className="flex flex-wrap items-end gap-2"
            >
              <input type="hidden" name="userId" value={u.id} />
              <div className="flex-1">
                <label className="label">Nom d&apos;utilisateur</label>
                <input name="username" defaultValue={u.username} className="input" />
              </div>
              <div className="w-40">
                <label className="label">Rôle</label>
                <select name="role" defaultValue={u.role} className="input">
                  <option value="USER">Utilisateur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
              <div className="w-48">
                <label className="label">Nouveau mot de passe</label>
                <input
                  name="newPassword"
                  type="text"
                  className="input"
                  placeholder="(laisser vide)"
                />
              </div>
              <button type="submit" className="btn-secondary">
                Enregistrer
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-[var(--color-muted)]">
                {u._count.lists} liste(s)
                {u.id === me.id ? " · c'est vous" : ""}
              </span>
              {u.id !== me.id && (
                <form action={adminDeleteUser}>
                  <input type="hidden" name="userId" value={u.id} />
                  <button type="submit" className="btn-danger text-sm">
                    Supprimer ce compte
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
