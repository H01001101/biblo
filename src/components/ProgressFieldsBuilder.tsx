"use client";

import { useState } from "react";
import type { ProgressField } from "@/lib/progress";

type BuilderField = {
  label: string;
  kind: "number" | "unit-number";
  unitsText: string; // unités séparées par des virgules (pour unit-number)
};

function toBuilder(fields: ProgressField[]): BuilderField[] {
  return fields.map((f) =>
    f.kind === "unit-number"
      ? { label: f.label, kind: "unit-number", unitsText: f.units.join(", ") }
      : { label: f.label, kind: "number", unitsText: "" },
  );
}

// Constructeur des "précisions d'avancement" (champs de progression) d'un type.
// Émet le JSON via un <input type="hidden" name={name}>.
export default function ProgressFieldsBuilder({
  name = "progressFields",
  initialFields = [],
}: {
  name?: string;
  initialFields?: ProgressField[];
}) {
  const [fields, setFields] = useState<BuilderField[]>(toBuilder(initialFields));

  const json = JSON.stringify(
    fields
      .filter((f) => f.label.trim())
      .map((f) =>
        f.kind === "unit-number"
          ? {
              kind: "unit-number",
              label: f.label.trim(),
              units: f.unitsText
                .split(",")
                .map((u) => u.trim())
                .filter(Boolean),
            }
          : { kind: "number", label: f.label.trim() },
      ),
  );

  function add() {
    setFields((f) => [...f, { label: "", kind: "number", unitsText: "" }]);
  }
  function update(i: number, patch: Partial<BuilderField>) {
    setFields((f) => f.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function remove(i: number) {
    setFields((f) => f.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <input type="hidden" name={name} value={json} />
      <div className="mb-2 flex items-center justify-between">
        <span className="label mb-0">Précisions d&apos;avancement ("en cours")</span>
        <button
          type="button"
          onClick={add}
          className="btn-secondary px-3 py-1 text-xs"
        >
          + Ajouter un champ
        </button>
      </div>
      {fields.length === 0 && (
        <p className="text-xs text-[var(--color-muted)]">
          Aucun champ : l&apos;avancement "en cours" ne demandera pas de précision
          (comme un jeu vidéo).
        </p>
      )}
      <div className="space-y-2">
        {fields.map((f, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2">
            <div className="flex-1">
              <label className="label text-xs">Libellé</label>
              <input
                className="input"
                placeholder="Ex : Épisode"
                value={f.label}
                onChange={(e) => update(i, { label: e.target.value })}
              />
            </div>
            <div className="w-40">
              <label className="label text-xs">Genre</label>
              <select
                className="input"
                value={f.kind}
                onChange={(e) =>
                  update(i, { kind: e.target.value as BuilderField["kind"] })
                }
              >
                <option value="number">Un nombre</option>
                <option value="unit-number">Unité + nombre</option>
              </select>
            </div>
            {f.kind === "unit-number" && (
              <div className="w-full">
                <label className="label text-xs">
                  Unités possibles (séparées par des virgules)
                </label>
                <input
                  className="input"
                  placeholder="Tome, Chapitre"
                  value={f.unitsText}
                  onChange={(e) => update(i, { unitsText: e.target.value })}
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="btn-danger px-3 py-2 text-xs"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
