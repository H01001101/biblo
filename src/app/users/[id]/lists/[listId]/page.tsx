import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  parseProgressFields,
  parseProgressValues,
  statusLabel,
  formatProgress,
} from "@/lib/progress";

// Détail (lecture seule) d'une liste d'un ami.
export default async function FriendListPage({
  params,
}: {
  params: Promise<{ id: string; listId: string }>;
}) {
  const { id, listId } = await params;
  const me = await requireUser();

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true },
  });
  if (!target) notFound();

  // Vérifie l'amitié (ou soi-même).
  if (target.id !== me.id) {
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { requesterId: me.id, addresseeId: target.id },
          { requesterId: target.id, addresseeId: me.id },
        ],
      },
    });
    if (!friendship) notFound();
  }

  // La liste doit appartenir à la cible et ne pas être masquée.
  const list = await prisma.list.findFirst({
    where: { id: listId, ownerId: target.id, hidden: false },
    include: {
      items: {
        orderBy: [
          { rating: { sort: "desc", nulls: "last" } },
          { position: "asc" },
          { addedAt: "asc" },
        ],
        include: { item: { include: { type: true } } },
      },
    },
  });
  if (!list) notFound();

  return (
    <div>
      <Link
        href={`/users/${target.id}`}
        className="mb-4 inline-flex text-sm text-[var(--color-muted)] hover:underline"
      >
        ← Listes de {target.username}
      </Link>
      <h1 className="mb-1 text-2xl font-semibold">{list.name}</h1>
      <p className="mb-6 text-sm text-[var(--color-muted)]">
        Liste de {target.username}
      </p>

      {list.items.length === 0 ? (
        <div className="card p-8 text-center text-sm text-[var(--color-muted)]">
          Liste vide
        </div>
      ) : (
        <div className="space-y-2">
          {list.items.map((li) => {
            const fields = parseProgressFields(li.item.type.progressFields);
            const progressText =
              li.status === "inProgress"
                ? formatProgress(fields, parseProgressValues(li.progress))
                : "";
            return (
              <div key={li.id} className="card flex items-center gap-3 p-3">
                <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface-2)]">
                  {li.item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={li.item.image}
                      alt={li.item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-xl text-[var(--color-muted)]/50">
                      x
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{li.item.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--color-muted)]">
                    <span className="badge">
                      {statusLabel(li.item.type, li.status)}
                    </span>
                    {progressText && <span>· {progressText}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {li.rating == null ? "—" : li.rating}
                  </div>
                  <div className="text-xs text-[var(--color-muted)]">note</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
