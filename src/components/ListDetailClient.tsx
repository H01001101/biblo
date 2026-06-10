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
  updateListItem,
  removeListItem,
  reorderListItems,
} from "@/app/actions/lists";
import {
  STATUS_KEYS,
  statusLabel,
  formatProgress,
  parseProgressValues,
  type ProgressField,
  type ProgressValues,
} from "@/lib/progress";
import ProgressFieldsInput from "@/components/ProgressFieldsInput";
import RatingSlider from "@/components/RatingSlider";
import ConfirmButton from "@/components/ConfirmButton";
import { NoImageIcon } from "@/components/icons";

type TypeInfo = {
  statusTodo: string;
  statusInProgress: string;
  statusDone: string;
  progressFields: ProgressField[];
};

export type ListItemRow = {
  listItemId: string;
  itemId: string;
  name: string;
  image: string;
  rating: number | null;
  status: string;
  progress: string | null;
  type: TypeInfo;
};

// Éditeur d'un élément. Remonté à chaque sauvegarde (via `key`) pour toujours
// repartir des valeurs enregistrées.
function RowEditor({ row }: { row: ListItemRow }) {
  const [status, setStatus] = useState(row.status);
  const [progress, setProgress] = useState<ProgressValues>(
    parseProgressValues(row.progress),
  );

  const statusLabels: Record<string, string> = {
    todo: row.type.statusTodo,
    inProgress: row.type.statusInProgress,
    done: row.type.statusDone,
  };

  return (
    <form
      action={updateListItem}
      className="space-y-3 border-t border-[var(--color-line)] bg-[var(--color-surface-2)] p-4"
    >
      <input type="hidden" name="listItemId" value={row.listItemId} />
      <input type="hidden" name="progress" value={JSON.stringify(progress)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Ma note</label>
          <RatingSlider name="rating" value={row.rating} />
        </div>
        <div>
          <label className="label">État d'avancement</label>
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
      </div>

      {status === "inProgress" && (
        <div className="rounded-lg bg-[var(--color-surface)] p-3">
          <ProgressFieldsInput
            fields={row.type.progressFields}
            values={progress}
            onChange={setProgress}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <button type="submit" className="btn-primary">
          Enregistrer
        </button>
        <ConfirmButton
          formAction={removeListItem}
          confirmLabel="Retirer cet élément ?"
        >
          Retirer de la liste
        </ConfirmButton>
      </div>
    </form>
  );
}

// Contenu visuel d'une ligne (commun aux modes "glisser-déposer" et simple).
function RowContent({
  row,
  listId,
  editing,
  setEditing,
  dragHandle,
}: {
  row: ListItemRow;
  listId: string;
  editing: boolean;
  setEditing: (v: boolean) => void;
  dragHandle?: React.ReactNode;
}) {
  const progressText =
    row.status === "inProgress"
      ? formatProgress(row.type.progressFields, parseProgressValues(row.progress))
      : "";

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        {/* Poignée de glisser-déposer (uniquement en vue complète) */}
        {dragHandle && <div className="shrink-0">{dragHandle}</div>}

        <Link href={`/lists/${listId}/${row.itemId}`} className="shrink-0">
          <div className="h-28 w-20 overflow-hidden rounded-lg bg-[var(--color-surface-2)]">
            {row.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.image}
                alt={row.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-[var(--color-muted)]/50">
                <NoImageIcon />
              </div>
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/lists/${listId}/${row.itemId}`}
            className="font-medium hover:underline"
          >
            {row.name}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--color-muted)]">
            <span className="badge">{statusLabel(row.type, row.status)}</span>
            {progressText && <span>· {progressText}</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-semibold">
              {row.rating == null ? "—" : row.rating}
            </div>
            <div className="text-xs text-[var(--color-muted)]">ma note</div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="btn-secondary text-sm"
          >
            {editing ? "Fermer" : "Modifier"}
          </button>
        </div>
      </div>

      {editing && (
        <RowEditor
          key={`${row.rating}|${row.status}|${row.progress ?? ""}`}
          row={row}
        />
      )}
    </div>
  );
}

// Icône de poignée (points), porteuse des écouteurs de glissement.
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

// Ligne déplaçable (glisser-déposer).
function SortableRow({ row, listId }: { row: ListItemRow; listId: string }) {
  const [editing, setEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.listItemId, disabled: editing });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <RowContent
        row={row}
        listId={listId}
        editing={editing}
        setEditing={setEditing}
        dragHandle={
          <GripHandle ref={setActivatorNodeRef} {...attributes} {...listeners} />
        }
      />
    </div>
  );
}

// Ligne simple (sans glisser-déposer, ex: quand un filtre est actif).
function PlainRow({ row, listId }: { row: ListItemRow; listId: string }) {
  const [editing, setEditing] = useState(false);
  return (
    <RowContent
      row={row}
      listId={listId}
      editing={editing}
      setEditing={setEditing}
    />
  );
}

export default function ListDetailClient({
  list,
  rows,
}: {
  list: { id: string; name: string; hidden: boolean };
  rows: ListItemRow[];
}) {
  const [items, setItems] = useState(rows);
  const [filter, setFilter] = useState<string>("all");
  // Le glisser-déposer (dnd-kit) ne doit s'activer qu'après le montage côté
  // client : sinon les attributs d'accessibilité diffèrent du rendu serveur
  // (erreur d'hydratation). Avant le montage, on rend des lignes simples.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Resynchronise l'état local avec les données serveur (édition, ajout, etc.).
  const propsKey = rows
    .map((r) => `${r.listItemId}:${r.rating}:${r.status}:${r.progress ?? ""}`)
    .join("|");
  useEffect(() => {
    setItems(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((r) => r.listItemId === active.id);
    const newIndex = items.findIndex((r) => r.listItemId === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    // Sécurité : on ne réordonne qu'entre éléments de même note.
    if (items[oldIndex].rating !== items[newIndex].rating) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next); // mise à jour optimiste (fluide)
    reorderListItems(
      list.id,
      next.map((r) => r.listItemId),
    );
  }

  const labelFor = (key: string): string => {
    const labels = new Set(
      items.map((r) =>
        key === "todo"
          ? r.type.statusTodo
          : key === "inProgress"
            ? r.type.statusInProgress
            : r.type.statusDone,
      ),
    );
    if (labels.size === 1) return [...labels][0];
    return key === "todo" ? "À faire" : key === "inProgress" ? "En cours" : "Terminé";
  };

  const filters: { key: string; label: string }[] = [
    { key: "all", label: "Tous" },
    ...STATUS_KEYS.map((k) => ({ key: k, label: labelFor(k) })),
  ];

  const dndEnabled = filter === "all" && mounted;
  const visible =
    filter === "all" ? items : items.filter((r) => r.status === filter);

  // Groupes de même note (chaque groupe = un contexte de glissement isolé,
  // ce qui confine naturellement le glisser-déposer aux éléments de même note).
  const groups: { rating: number | null; rows: ListItemRow[] }[] = [];
  for (const row of items) {
    const last = groups[groups.length - 1];
    if (last && last.rating === row.rating) last.rows.push(row);
    else groups.push({ rating: row.rating, rows: [row] });
  }

  return (
    <div>
      <Link
        href="/lists"
        className="mb-4 inline-flex text-sm text-[var(--color-muted)] hover:underline"
      >
        ← Mes Listes
      </Link>

      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{list.name}</h1>
        {list.hidden && <span className="badge">Masquée</span>}
      </div>

      {items.length === 0 ? (
        <div className="card grid place-items-center gap-2 p-12 text-center">
          <p className="font-medium">Cette liste est vide</p>
          <p className="text-sm text-[var(--color-muted)]">
            Ajoute des éléments depuis le catalogue
          </p>
          <Link href="/" className="btn-primary mt-2">
            Parcourir le catalogue
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.map((f) => {
              const count =
                f.key === "all"
                  ? items.length
                  : items.filter((r) => r.status === f.key).length;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={
                    filter === f.key ? "btn-primary text-sm" : "btn-secondary text-sm"
                  }
                >
                  {f.label} ({count})
                </button>
              );
            })}
          </div>

          <p className="mb-3 text-sm text-[var(--color-muted)]">
            Triés par note.{" "}
            {filter === "all"
              ? "Glisse un élément par sa poignée pour classer ceux de même note"
              : "Retire le filtre pour réordonner par glisser-déposer"}
          </p>

          {visible.length === 0 ? (
            <div className="card p-8 text-center text-sm text-[var(--color-muted)]">
              Aucun élément dans cet état
            </div>
          ) : dndEnabled ? (
            <div className="space-y-3">
              {groups.map((group) => (
                <DndContext
                  key={`${group.rating}-${group.rows[0].listItemId}`}
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={group.rows.map((r) => r.listItemId)}
                    strategy={verticalListSortingStrategy}
                  >
                    {group.rows.map((row) => (
                      <SortableRow
                        key={row.listItemId}
                        row={row}
                        listId={list.id}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((row) => (
                <PlainRow key={row.listItemId} row={row} listId={list.id} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
