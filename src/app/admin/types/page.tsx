import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseProgressFields } from "@/lib/progress";
import { adminDeleteType } from "@/app/actions/types";
import TypeForm from "@/components/TypeForm";
import ConfirmButton from "@/components/ConfirmButton";

export default async function AdminTypesPage() {
  await requireAdmin();

  const types = await prisma.itemType.findMany({
    orderBy: [{ isNative: "desc" }, { name: "asc" }],
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Types d&apos;éléments</h1>
        <Link href="/admin" className="btn-secondary">
          ← Validation des éléments
        </Link>
      </div>

      <div className="card p-4">
        <h2 className="mb-3 font-medium">Créer un type</h2>
        <TypeForm mode="create" />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Types existants ({types.length})</h2>
        {types.map((t) => {
          const fields = parseProgressFields(t.progressFields);
          const inUse = t._count.items;
          return (
            <details key={t.id} className="card overflow-hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-3 p-4">
                <span className="flex items-center gap-2 font-medium">
                  {t.name}
                  {t.isNative && <span className="badge">Natif</span>}
                </span>
                <span className="text-sm text-[var(--color-muted)]">
                  {inUse} élément{inUse > 1 ? "s" : ""} ·{" "}
                  {t.statusTodo} / {t.statusInProgress} / {t.statusDone}
                </span>
              </summary>

              <div className="space-y-4 border-t border-[var(--color-line)] bg-[var(--color-surface-2)] p-4">
                <TypeForm
                  mode="edit"
                  type={{
                    id: t.id,
                    name: t.name,
                    statusTodo: t.statusTodo,
                    statusInProgress: t.statusInProgress,
                    statusDone: t.statusDone,
                    progressFields: fields,
                  }}
                />

                <div className="border-t border-[var(--color-line)] pt-3">
                  {inUse === 0 ? (
                    <form action={adminDeleteType}>
                      <input type="hidden" name="typeId" value={t.id} />
                      <ConfirmButton
                        confirmLabel={`Supprimer le type "${t.name}" ?`}
                      >
                        Supprimer ce type
                      </ConfirmButton>
                    </form>
                  ) : (
                    <p className="text-xs text-[var(--color-muted)]">
                      Suppression impossible : {inUse} élément
                      {inUse > 1 ? "s utilisent" : " utilise"} ce type. Change
                      d&apos;abord leur type (ou supprime-les) depuis le catalogue.
                    </p>
                  )}
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
