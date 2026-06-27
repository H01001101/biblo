"use client";

import { useActionState } from "react";
import {
  adminCreateType,
  adminUpdateType,
  type TypeActionState,
} from "@/app/actions/types";
import ProgressFieldsBuilder from "@/components/ProgressFieldsBuilder";
import type { ProgressField } from "@/lib/progress";

type TypeData = {
  id: string;
  name: string;
  statusTodo: string;
  statusInProgress: string;
  statusDone: string;
  progressFields: ProgressField[];
};

export default function TypeForm({
  mode,
  type,
}: {
  mode: "create" | "edit";
  type?: TypeData;
}) {
  const action = mode === "create" ? adminCreateType : adminUpdateType;
  const [state, formAction, pending] = useActionState<TypeActionState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      {mode === "edit" && type && (
        <input type="hidden" name="typeId" value={type.id} />
      )}

      <div>
        <label className="label">Nom du type</label>
        <input
          name="name"
          className="input"
          required
          defaultValue={type?.name ?? ""}
          placeholder="Ex : Podcast"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="label">État "à faire"</label>
          <input
            name="statusTodo"
            className="input"
            defaultValue={type?.statusTodo ?? ""}
            placeholder="À écouter"
          />
        </div>
        <div>
          <label className="label">État "en cours"</label>
          <input
            name="statusInProgress"
            className="input"
            defaultValue={type?.statusInProgress ?? ""}
            placeholder="En cours"
          />
        </div>
        <div>
          <label className="label">État "terminé"</label>
          <input
            name="statusDone"
            className="input"
            defaultValue={type?.statusDone ?? ""}
            placeholder="Écouté"
          />
        </div>
      </div>

      <ProgressFieldsBuilder initialFields={type?.progressFields ?? []} />

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
        {pending
          ? "Enregistrement…"
          : mode === "create"
            ? "Créer le type"
            : "Enregistrer"}
      </button>
    </form>
  );
}
