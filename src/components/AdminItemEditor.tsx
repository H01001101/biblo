"use client";

import { useActionState, useState } from "react";
import {
  adminUpdateItem,
  adminDeleteItem,
  type ActionState,
} from "@/app/actions/items";
import ConfirmButton from "@/components/ConfirmButton";

type ItemData = {
  id: string;
  name: string;
  image: string;
  description: string;
  typeId: string;
};

export default function AdminItemEditor({
  item,
  types,
}: {
  item: ItemData;
  types: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    adminUpdateItem,
    {},
  );
  const [preview, setPreview] = useState<string | null>(item.image || null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="card border-amber-300/60 p-4">
      <h2 className="mb-1 font-medium">🛠️ Espace administrateur</h2>
      <p className="mb-4 text-sm text-[var(--color-muted)]">
        Modifier ou supprimer cet élément du catalogue.
      </p>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="itemId" value={item.id} />

        <div>
          <label className="label">Nom</label>
          <input name="name" defaultValue={item.name} className="input" required />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Type</label>
            <select name="typeId" defaultValue={item.typeId} className="input">
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              defaultValue={item.description}
              className="input min-h-10"
            />
          </div>
        </div>

        <div>
          <label className="label">Image de couverture</label>
          <div className="flex items-start gap-3">
            <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)]">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-xl text-[var(--color-muted)]/50">
                  🖼️
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="block w-full text-sm text-[var(--color-muted)] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[var(--color-accent)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--color-accent-ink)]"
              />
              <input
                name="image"
                defaultValue={item.image}
                className="input"
                placeholder="… ou URL de l'image"
              />
            </div>
          </div>
        </div>

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Modifications enregistrées.
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </form>

      <div className="mt-4 border-t border-[var(--color-line)] pt-4">
        <form action={adminDeleteItem}>
          <input type="hidden" name="itemId" value={item.id} />
          <ConfirmButton confirmLabel="Supprimer définitivement cet élément du catalogue ?">
            Supprimer du catalogue
          </ConfirmButton>
        </form>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          L&apos;élément sera retiré du catalogue et de toutes les listes des utilisateurs.
        </p>
      </div>
    </div>
  );
}
