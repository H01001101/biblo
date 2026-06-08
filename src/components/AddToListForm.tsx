"use client";

import { useActionState, useState } from "react";
import { addToList, type ActionState } from "@/app/actions/items";
import { STATUS_KEYS, type ProgressField, type ProgressValues } from "@/lib/progress";
import ProgressFieldsInput from "@/components/ProgressFieldsInput";
import RatingSlider from "@/components/RatingSlider";

type TypeInfo = {
  statusTodo: string;
  statusInProgress: string;
  statusDone: string;
  progressFields: ProgressField[];
};

export default function AddToListForm({
  itemId,
  type,
  lists,
}: {
  itemId: string;
  type: TypeInfo;
  lists: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addToList,
    {},
  );

  const [listId, setListId] = useState(lists[0]?.id ?? "__new__");
  const [status, setStatus] = useState<string>("todo");
  const [progress, setProgress] = useState<ProgressValues>({});

  const statusLabels: Record<string, string> = {
    todo: type.statusTodo,
    inProgress: type.statusInProgress,
    done: type.statusDone,
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="progress" value={JSON.stringify(progress)} />

      <div>
        <label className="label">Liste</label>
        <select
          name="listId"
          className="input"
          value={listId}
          onChange={(e) => setListId(e.target.value)}
        >
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
          <option value="__new__"> + Nouvelle liste</option>
        </select>
      </div>

      {listId === "__new__" && (
        <div>
          <label className="label">Nom de la nouvelle liste</label>
          <input name="newListName" className="input" placeholder="Ex : Mes mangas" />
        </div>
      )}

      <div>
        <label className="label">Ma note</label>
        <RatingSlider name="rating" />
      </div>

      <div>
        <label className="label">État d&apos;avancement</label>
        <select
          name="status"
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_KEYS.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
      </div>

      {status === "inProgress" && (
        <div className="rounded-lg bg-[var(--color-surface-2)] p-3">
          <ProgressFieldsInput
            fields={type.progressFields}
            values={progress}
            onChange={setProgress}
          />
        </div>
      )}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Ajout en cours…" : "Ajouter à ma liste"}
      </button>
    </form>
  );
}
