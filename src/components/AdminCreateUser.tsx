"use client";

import { useActionState } from "react";
import { adminCreateUser, type AdminState } from "@/app/actions/admin";

export default function AdminCreateUser() {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    adminCreateUser,
    {},
  );

  return (
    <form action={action} className="card space-y-3 p-4">
      <h2 className="font-medium">Créer un compte</h2>
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <label className="label">Nom d&apos;utilisateur</label>
          <input name="username" className="input" required />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <input name="password" type="text" className="input" required />
        </div>
        <div>
          <label className="label">Rôle</label>
          <select name="role" className="input" defaultValue="USER">
            <option value="USER">Utilisateur</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>
      </div>
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.success}
        </p>
      )}
      <button type="submit" className="btn-primary" disabled={pending}>
        Créer le compte
      </button>
    </form>
  );
}
