"use client";

import { useRouter, useSearchParams } from "next/navigation";

// Pagination du catalogue : Précédent / Suivant + sélecteur pour aller
// directement à une page. Conserve les filtres en cours.
export default function CatalogPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const params = useSearchParams();

  if (totalPages <= 1) return null;

  function go(p: number) {
    const sp = new URLSearchParams(params.toString());
    sp.set("page", String(p));
    router.push(`/?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className="btn-secondary disabled:opacity-40"
      >
        ← Précédent
      </button>

      <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
        Page
        <select
          value={page}
          onChange={(e) => go(Number(e.target.value))}
          className="input w-auto py-1.5"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        / {totalPages}
      </label>

      <button
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className="btn-secondary disabled:opacity-40"
      >
        Suivant →
      </button>
    </div>
  );
}
