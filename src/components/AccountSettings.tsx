"use client";

import { useActionState } from "react";
import {
  changeUsername,
  changePassword,
  type ProfileState,
} from "@/app/actions/profile";

function Feedback({ state }: { state: ProfileState }) {
  if (state.error)
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
        {state.error}
      </p>
    );
  if (state.success)
    return (
      <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
        {state.success}
      </p>
    );
  return null;
}

export default function AccountSettings({ username }: { username: string }) {
  const [nameState, nameAction, namePending] = useActionState<
    ProfileState,
    FormData
  >(changeUsername, {});
  const [passState, passAction, passPending] = useActionState<
    ProfileState,
    FormData
  >(changePassword, {});

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <form action={nameAction} className="card space-y-3 p-4">
        <h2 className="font-medium">Nom d&apos;utilisateur</h2>
        <div>
          <label className="label">Nouveau nom</label>
          <input
            name="username"
            className="input"
            defaultValue={username}
            required
          />
        </div>
        <Feedback state={nameState} />
        <button type="submit" className="btn-primary" disabled={namePending}>
          {namePending ? "…" : "Mettre à jour"}
        </button>
      </form>

      <form action={passAction} className="card space-y-3 p-4">
        <h2 className="font-medium">Mot de passe</h2>
        <div>
          <label className="label">Mot de passe actuel</label>
          <input name="current" type="password" className="input" required />
        </div>
        <div>
          <label className="label">Nouveau mot de passe</label>
          <input name="next" type="password" className="input" required />
        </div>
        <div>
          <label className="label">Confirmer</label>
          <input name="confirm" type="password" className="input" required />
        </div>
        <Feedback state={passState} />
        <button type="submit" className="btn-primary" disabled={passPending}>
          {passPending ? "…" : "Changer le mot de passe"}
        </button>
      </form>
    </div>
  );
}
