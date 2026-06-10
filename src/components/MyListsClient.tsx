"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createList,
  renameList,
  deleteList,
  toggleListHidden,
  reorderLists,
} from "@/app/actions/lists";
import ConfirmButton from "@/components/ConfirmButton";
import { NoImageIcon } from "@/components/icons";

type ListRow = {
  id: string;
  name: string;
  hidden: boolean;
  count: number;
  cover: string | null;
};

function GripHandle({ ref, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      ref={ref}
      type="button"
      title="Glisser pour réordonner"
      aria-label="Glisser pour réordonner"
      className="cursor-grab touch-none px-1 text-[var(--color-muted)] hover:text-[var(--color-ink)] active:cursor-grabbing"
      {...props}
    >
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
        <circle cx="7" cy="5" r="1.6" />
        <circle cx="13" cy="5" r="1.6" />
        <circle cx="7" cy="10" r="1.6" />
        <circle cx="13" cy="10" r="1.6" />
        <circle cx="7" cy="15" r="1.6" />
        <circle cx="13" cy="15" r="1.6" />
      </svg>
    </button>
  );
}

// Contenu visuel d'une carte de liste (couverture + nom + nombre).
function ListCardInner({ list }: { list: ListRow }) {
  return (
    <>
      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-[var(--color-surface-2)]">
        {list.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={list.cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-[var(--color-muted)]/50">
            <NoImageIcon />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium">{list.name}</h3>
        <p className="text-sm text-[var(--color-muted)]">
          {list.count} élément{list.count > 1 ? "s" : ""}
        </p>
      </div>
      {list.hidden && <span className="badge">Masquée</span>}
    </>
  );
}

function SortableListCard({ list }: { list: ListRow }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    position: "relative",
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="card flex items-center gap-2 p-3">
      <GripHandle ref={setActivatorNodeRef} {...attributes} {...listeners} />
      <Link
        href={`/lists/${list.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <ListCardInner list={list} />
      </Link>
    </div>
  );
}

export default function MyListsClient({ lists }: { lists: ListRow[] }) {
  const [items, setItems] = useState(lists);
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Resynchronise avec les données serveur (ajout, renommage, suppression…).
  const propsKey = lists.map((l) => `${l.id}:${l.name}:${l.hidden}:${l.count}`).join("|");
  useEffect(() => {
    setItems(lists);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((l) => l.id === active.id);
    const newIndex = items.findIndex((l) => l.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    reorderLists(next.map((l) => l.id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes Listes</h1>
          <p className="text-sm text-[var(--color-muted)]">
            {items.length} liste{items.length > 1 ? "s" : ""}
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

      {items.length === 0 ? (
        <div className="card grid place-items-center gap-2 p-12 text-center">
          <p className="font-medium">Tu n&apos;as aucune liste</p>
          <p className="text-sm text-[var(--color-muted)]">
            Clique sur "Modifier" pour en créer une, ou ajoute un élément depuis
            le catalogue
          </p>
        </div>
      ) : editing ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((list) => (
            <div key={list.id} className="card space-y-3 p-4">
              <form action={renameList} className="flex gap-2">
                <input type="hidden" name="listId" value={list.id} />
                <input name="name" defaultValue={list.name} className="input" />
                <button type="submit" className="btn-secondary">
                  Renommer
                </button>
              </form>
              <div className="flex items-center justify-between">
                <form action={toggleListHidden}>
                  <input type="hidden" name="listId" value={list.id} />
                  <button type="submit" className="btn-ghost text-sm">
                    {list.hidden ? "Masquée — afficher" : "Visible — masquer"}
                  </button>
                </form>
                <form action={deleteList}>
                  <input type="hidden" name="listId" value={list.id} />
                  <ConfirmButton confirmLabel={`Supprimer "${list.name}" ?`}>
                    Supprimer
                  </ConfirmButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-[var(--color-muted)]">
            Glisse une liste par sa poignée pour changer l&apos;ordre.
          </p>
          {mounted ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {items.map((list) => (
                    <SortableListCard key={list.id} list={list} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="space-y-3">
              {items.map((list) => (
                <Link
                  key={list.id}
                  href={`/lists/${list.id}`}
                  className="card flex items-center gap-3 p-3"
                >
                  <ListCardInner list={list} />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
