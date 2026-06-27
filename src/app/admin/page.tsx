import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NoImageIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { moderateItem } from "@/app/actions/items";

export default async function AdminPage() {
  await requireAdmin();

  const [pending, types] = await Promise.all([
    prisma.item.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        type: { select: { name: true } },
        createdBy: { select: { username: true } },
      },
    }),
    prisma.itemType.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Espace administrateur</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Valide les propositions d'éléments
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/types" className="btn-secondary">
            Gérer les types
          </Link>
          <Link href="/admin/users" className="btn-secondary">
            Gérer les utilisateurs
          </Link>
        </div>
      </div>

      <h2 className="text-lg font-semibold">
        Éléments en attente ({pending.length})
      </h2>

      {pending.length === 0 ? (
        <div className="card p-8 text-center text-sm text-[var(--color-muted)]">
          Aucune proposition en attente
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((item) => (
            <form
              key={item.id}
              action={moderateItem}
              className="card flex flex-col gap-3 p-4 sm:flex-row"
            >
              <input type="hidden" name="itemId" value={item.id} />
              <div className="h-40 w-28 shrink-0 overflow-hidden rounded bg-[var(--color-surface-2)]">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-[var(--color-muted)]/50"><NoImageIcon /></div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-xs text-[var(--color-muted)]">
                  Proposé par {item.createdBy?.username ?? "—"}
                </p>
                <div>
                  <label className="label">Nom</label>
                  <input name="name" defaultValue={item.name} className="input" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="label">Type</label>
                    <select name="typeId" defaultValue={item.typeId} className="input">
                      {types.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Image (URL)</label>
                    <input name="image" defaultValue={item.image} className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    name="description"
                    defaultValue={item.description}
                    className="input min-h-20"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    name="decision"
                    value="approve"
                    className="btn-primary"
                  >
                    Valider (avec modifications)
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="reject"
                    className="btn-danger"
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
