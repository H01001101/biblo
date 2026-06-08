"use client";

import type { ProgressField, ProgressValues } from "@/lib/progress";

// Saisie des champs de progression (uniquement utile quand l'état est "En cours").
export default function ProgressFieldsInput({
  fields,
  values,
  onChange,
}: {
  fields: ProgressField[];
  values: ProgressValues;
  onChange: (values: ProgressValues) => void;
}) {
  if (fields.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Ce type ne demande pas de précision d'avancement
      </p>
    );
  }

  function setNumber(key: string, n: number) {
    onChange({ ...values, [key]: n });
  }
  function setUnit(key: string, unit: string, value: number) {
    onChange({ ...values, [key]: { unit, value } });
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {fields.map((field) => {
        if (field.kind === "unit-number") {
          const current = values[field.key];
          const unit =
            current && typeof current === "object" ? current.unit : field.units[0];
          const value =
            current && typeof current === "object" ? current.value : "";
          return (
            <div key={field.key} className="col-span-2">
              <label className="label">{field.label}</label>
              <div className="flex gap-2">
                <select
                  className="input max-w-[10rem]"
                  value={unit}
                  onChange={(e) =>
                    setUnit(field.key, e.target.value, Number(value) || 0)
                  }
                >
                  {field.units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  className="input"
                  placeholder="N°"
                  value={value}
                  onChange={(e) =>
                    setUnit(field.key, unit, Number(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          );
        }
        const current = values[field.key];
        const value = typeof current === "number" ? current : "";
        return (
          <div key={field.key}>
            <label className="label">{field.label}</label>
            <input
              type="number"
              min={0}
              className="input"
              value={value}
              onChange={(e) => setNumber(field.key, Number(e.target.value) || 0)}
            />
          </div>
        );
      })}
    </div>
  );
}
