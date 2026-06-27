"use client";

import { useActionState, useState } from "react";
import { createItem, type ActionState } from "@/app/actions/items";
import { NoImageIcon } from "@/components/icons";
import ProgressFieldsBuilder from "@/components/ProgressFieldsBuilder";

export default function CreateItemForm({
  types,
  isAdmin,
}: {
  types: { id: string; name: string }[];
  isAdmin: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createItem,
    {},
  );

  const [typeMode, setTypeMode] = useState<"existing" | "new">("existing");
  const [typeId, setTypeId] = useState(types[0]?.id ?? "");
  const [preview, setPreview] = useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="typeMode" value={typeMode} />

      <div>
        <label className="label">Nom de l&apos;élément</label>
        <input name="name" className="input" required placeholder="Ex : Naruto" />
      </div>

      <div>
        <label className="label">Image de couverture</label>
        <div className="flex items-start gap-3">
          <div className="h-32 w-24 shrink-0 overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)]">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-[var(--color-muted)]/50">
                <NoImageIcon />
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
            <p className="text-xs text-[var(--color-muted)]">
              Choisis une image depuis ton ordinateur (max 1 Mo)
            </p>
            <input
              name="image"
              className="input"
              placeholder="… ou colle l'adresse (URL) d'une image"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          name="description"
          className="input min-h-24"
          placeholder="De quoi parle cet élément ?"
        />
      </div>

      {/* Choix du type : existant ou nouveau */}
      <div>
        <label className="label">Type d&apos;élément</label>
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            onClick={() => setTypeMode("existing")}
            className={typeMode === "existing" ? "btn-primary" : "btn-secondary"}
          >
            Type existant
          </button>
          <button
            type="button"
            onClick={() => setTypeMode("new")}
            className={typeMode === "new" ? "btn-primary" : "btn-secondary"}
          >
            Nouveau type
          </button>
        </div>

        {typeMode === "existing" ? (
          <select
            name="typeId"
            className="input"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
          >
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="card space-y-4 p-4">
            <div>
              <label className="label">Nom du nouveau type</label>
              <input
                name="newTypeName"
                className="input"
                placeholder="Ex : Podcast"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="label">État "à faire"</label>
                <input name="statusTodo" className="input" placeholder="À écouter" />
              </div>
              <div>
                <label className="label">État "en cours"</label>
                <input
                  name="statusInProgress"
                  className="input"
                  placeholder="En cours"
                />
              </div>
              <div>
                <label className="label">État "terminé"</label>
                <input name="statusDone" className="input" placeholder="Écouté" />
              </div>
            </div>
            <ProgressFieldsBuilder />
          </div>
        )}
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
        {isAdmin
          ? "En tant qu'administrateur, l'élément sera ajouté directement au catalogue"
          : "Ton élément sera proposé à l'admin pour validation avant d'apparaître dans le catalogue"}
      </div>

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Envoi…" : "Créer l'élément"}
      </button>
    </form>
  );
}
