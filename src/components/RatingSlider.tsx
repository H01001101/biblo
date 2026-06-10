"use client";

import { useState } from "react";

// Curseur de note de 0 à 10 par pas de 0,5, avec une option "sans note".
// Émet sa valeur via un <input type="hidden" name={name}> (vide = pas de note).
export default function RatingSlider({
  name = "rating",
  value,
}: {
  name?: string;
  value?: number | string | null;
}) {
  const hasInitial =
    value !== null && value !== undefined && String(value) !== "";
  const [rated, setRated] = useState(hasInitial);
  const [val, setVal] = useState(hasInitial ? Number(value) : 7);

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={rated ? String(val) : ""} />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={rated}
          onChange={(e) => setRated(e.target.checked)}
          className="h-4 w-4 accent-[var(--color-accent)]"
        />
        Donner une note
      </label>

      {rated && (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={val}
            onChange={(e) => setVal(Number(e.target.value))}
            className="h-2 flex-1 cursor-pointer accent-[var(--color-accent)]"
          />
          <span className="w-14 shrink-0 text-right text-lg font-semibold tabular-nums">
            {val.toFixed(1)}
            <span className="text-sm text-[var(--color-muted)]">/10</span>
          </span>
        </div>
      )}
    </div>
  );
}
