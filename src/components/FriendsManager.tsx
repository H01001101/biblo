"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  type FriendState,
} from "@/app/actions/friends";

type Friend = { friendshipId: string; id: string; username: string };
type Request = { friendshipId: string; username: string };

export default function FriendsManager({
  friends,
  received,
  sent,
}: {
  friends: Friend[];
  received: Request[];
  sent: Request[];
}) {
  const [state, action, pending] = useActionState<FriendState, FormData>(
    sendFriendRequest,
    {},
  );

  return (
    <div className="space-y-4">
      {/* Ajouter un ami */}
      <form action={action} className="card space-y-3 p-4">
        <h2 className="font-medium">Ajouter un ami</h2>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1">
            <label className="label">Nom d'utilisateur</label>
            <input
              name="username"
              className="input"
              placeholder="Ex : bob"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={pending}>
            Envoyer la demande
          </button>
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
      </form>

      {/* Demandes reçues */}
      {received.length > 0 && (
        <div className="card p-4">
          <h2 className="mb-3 font-medium">
            Demandes reçues ({received.length})
          </h2>
          <div className="space-y-2">
            {received.map((r) => (
              <div
                key={r.friendshipId}
                className="flex items-center justify-between rounded-lg border border-[var(--color-line)] p-2"
              >
                <span className="font-medium">{r.username}</span>
                <div className="flex gap-2">
                  <form action={acceptFriendRequest}>
                    <input type="hidden" name="friendshipId" value={r.friendshipId} />
                    <button className="btn-primary text-sm">Accepter</button>
                  </form>
                  <form action={rejectFriendRequest}>
                    <input type="hidden" name="friendshipId" value={r.friendshipId} />
                    <button className="btn-secondary text-sm">Refuser</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste d'amis */}
      <div className="card p-4">
        <h2 className="mb-3 font-medium">Mes amis ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            Tu n'as pas d'amis. Envoie une demande ci-dessus si t'en veux
          </p>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div
                key={f.friendshipId}
                className="flex items-center justify-between rounded-lg border border-[var(--color-line)] p-2"
              >
                <Link
                  href={`/users/${f.id}`}
                  className="font-medium hover:underline"
                >
                  {f.username}
                </Link>
                <div className="flex items-center gap-2">
                  <Link href={`/users/${f.id}`} className="btn-secondary text-sm">
                    Voir le profil
                  </Link>
                  <form action={removeFriend}>
                    <input type="hidden" name="friendshipId" value={f.friendshipId} />
                    <button className="btn-danger text-sm">Retirer</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demandes envoyées en attente */}
      {sent.length > 0 && (
        <div className="card p-4">
          <h2 className="mb-3 font-medium">Demandes envoyées</h2>
          <div className="flex flex-wrap gap-2">
            {sent.map((s) => (
              <span key={s.friendshipId} className="badge">
                {s.username} · en attente
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
