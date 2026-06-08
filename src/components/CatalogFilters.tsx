"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function CatalogFilters({
  types,
}: {
  types: { id: string; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");

  // Met à jour l'URL en conservant les autres filtres.
  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) sp.set(key, value);
      else sp.delete(key);
    }
    sp.delete("page"); // tout changement de filtre revient à la page 1
    router.push(`/?${sp.toString()}`);
  }

  // Recherche avec un léger délai (debounce) pour ne pas naviguer à chaque touche.
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (q === current) return;
    const t = setTimeout(() => update({ q }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="label" htmlFor="search">
          Rechercher
        </label>
        <input
          id="search"
          className="input"
          placeholder="Nom d'un élément…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="sm:w-44">
        <label className="label" htmlFor="type">
          Type
        </label>
        <select
          id="type"
          className="input"
          value={params.get("type") ?? ""}
          onChange={(e) => update({ type: e.target.value })}
        >
          <option value="">Tous les types</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:w-44">
        <label className="label" htmlFor="note">
          Note moyenne
        </label>
        <select
          id="note"
          className="input"
          value={params.get("note") ?? ""}
          onChange={(e) => update({ note: e.target.value })}
        >
          <option value="">Toutes les notes</option>
          <option value="9">9 et plus</option>
          <option value="8">8 et plus</option>
          <option value="7">7 et plus</option>
          <option value="6">6 et plus</option>
          <option value="5">5 et plus</option>
        </select>
      </div>
    </div>
  );
}
