import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export default async function FriendProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await requireUser();

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true },
  });
  if (!target) notFound();

  const isSelf = target.id === me.id;

  // On vérifie l'amitié (sauf si on consulte son propre profil).
  let allowed = isSelf;
  if (!allowed) {
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { requesterId: me.id, addresseeId: target.id },
          { requesterId: target.id, addresseeId: me.id },
        ],
      },
    });
    allowed = !!friendship;
  }

  if (!allowed) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <p className="font-medium">{target.username}</p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Tu dois être amis pour consulter ce profil
        </p>
        <Link href="/profile" className="btn-primary mt-4">
          Retour au profil
        </Link>
      </div>
    );
  }

  // On affiche seulement la LISTE DES LISTES (non masquées) ; le détail se voit en cliquant.
  const lists = await prisma.list.findMany({
    where: { ownerId: target.id, hidden: false },
    orderBy: { position: "asc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <Link
        href="/profile"
        className="mb-4 inline-flex text-sm text-[var(--color-muted)] hover:underline"
      >
        ← Retour
      </Link>
      <h1 className="mb-1 text-2xl font-semibold">Profil de {target.username}</h1>
      <p className="mb-6 text-sm text-[var(--color-muted)]">
        {lists.length} liste{lists.length > 1 ? "s" : ""} visible
        {lists.length > 1 ? "s" : ""}
      </p>

      {lists.length === 0 ? (
        <div className="card p-8 text-center text-sm text-[var(--color-muted)]">
          Aucune liste visible
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/users/${target.id}/lists/${list.id}`}
              className="card flex items-center justify-between p-4 transition-shadow hover:shadow-md"
            >
              <div>
                <h3 className="font-medium">{list.name}</h3>
                <p className="text-sm text-[var(--color-muted)]">
                  {list._count.items} élément{list._count.items > 1 ? "s" : ""}
                </p>
              </div>
              <span className="text-[var(--color-muted)]">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
