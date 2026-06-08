"use client";

import Link from "next/link";
import { useState } from "react";
import {
  createList,
  renameList,
  deleteList,
  toggleListHidden,
} from "@/app/actions/lists";
import ConfirmButton from "@/components/ConfirmButton";

type ListRow = {
  id: string;
  name: string;
  hidden: boolean;
  count: number;
};

export default function MyListsClient({ lists }: { lists: ListRow[] }) {
  const [editing, setEditing] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes Listes</h1>
          <p className="text-sm text-[var(--color-muted)]">
            {lists.length} liste{lists.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className={editing ? "btn-primary" : "btn-secondary"}
        >
          {editing ? "Terminer" : "Modifier"}
        </button>
      </div>

      {/* Création d'une nouvelle liste (visible en mode édition) */}
      {editing && (
        <form
          action={createList}
          className="card mb-4 flex flex-wrap items-end gap-2 p-4"
        >
          <div className="flex-1">
            <label className="label">Nouvelle liste</label>
            <input
              name="name"
              className="input"
              placeholder="Ex : Films à voir"
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Créer
          </button>
        </form>
      )}

      {lists.length === 0 ? (
        <div className="card grid place-items-center gap-2 p-12 text-center">
          <p className="font-medium">Tu n'as aucune liste</p>
          <p className="text-sm text-[var(--color-muted)]">
            Clique sur "Modifier" pour en créer une, ou ajoute un élément depuis
            le catalogue
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {lists.map((list) =>
            editing ? (
              <div key={list.id} className="card space-y-3 p-4">
                <form action={renameList} className="flex gap-2">
                  <input type="hidden" name="listId" value={list.id} />
                  <input
                    name="name"
                    defaultValue={list.name}
                    className="input"
                  />
                  <button type="submit" className="btn-secondary">
                    Renommer
                  </button>
                </form>
                <div className="flex items-center justify-between">
                  <form action={toggleListHidden}>
                    <input type="hidden" name="listId" value={list.id} />
                    <button type="submit" className="btn-ghost text-sm">
                      {list.hidden ? "🙈 Masquée — afficher" : "👁️ Visible — masquer"}
                    </button>
                  </form>
                  <form action={deleteList}>
                    <input type="hidden" name="listId" value={list.id} />
                    <ConfirmButton confirmLabel={`Supprimer « ${list.name} » ?`}>
                      Supprimer
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            ) : (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="card flex items-center justify-between p-4 transition-shadow hover:shadow-md"
              >
                <div>
                  <h3 className="font-medium">{list.name}</h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    {list.count} élément{list.count > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {list.hidden && <span className="badge">Masquée</span>}
                  <span className="text-[var(--color-muted)]">→</span>
                </div>
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}
