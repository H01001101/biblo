import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getItemAverage, formatAvg } from "@/lib/queries";
import { parseProgressFields } from "@/lib/progress";
import AddToListForm from "@/components/AddToListForm";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [item, user] = await Promise.all([
    prisma.item.findUnique({
      where: { id },
      include: { type: true },
    }),
    getCurrentUser(),
  ]);

  if (!item || item.status !== "APPROVED") notFound();

  const { avg, count } = await getItemAverage(item.id);

  const lists =
    user && user.role !== "ADMIN"
      ? await prisma.list.findMany({
          where: { ownerId: user.id },
          orderBy: { position: "asc" },
          select: { id: true, name: true },
        })
      : [];

  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-flex text-sm text-[var(--color-muted)] hover:underline"
      >
        ← Retour au catalogue
      </Link>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="card aspect-[2/3] overflow-hidden bg-[var(--color-surface-2)]">
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-5xl text-[var(--color-muted)]/50">
              x
            </div>
          )}
        </div>

        <div>
          <span className="badge mb-2">{item.type.name}</span>
          <h1 className="text-2xl font-semibold">{item.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-amber-500">★</span>
            <span className="font-medium">{formatAvg(avg)}</span>
            <span className="text-[var(--color-muted)]">
              {count > 0
                ? `· moyenne sur ${count} note${count > 1 ? "s" : ""}`
                : "· pas encore noté"}
            </span>
          </div>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--color-ink)]">
            {item.description || "Aucune description."}
          </p>

          <div className="mt-6 max-w-md">
            {!user ? (
              <Link href="/login" className="btn-primary">
                Se connecter pour ajouter
              </Link>
            ) : user.role === "ADMIN" ? (
              <p className="rounded-lg bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-muted)]">
                Les admins ne gèrent pas de listes personnelles
              </p>
            ) : (
              <div className="card p-4">
                <h2 className="mb-3 font-medium">Ajouter à une liste</h2>
                <AddToListForm
                  itemId={item.id}
                  type={{
                    statusTodo: item.type.statusTodo,
                    statusInProgress: item.type.statusInProgress,
                    statusDone: item.type.statusDone,
                    progressFields: parseProgressFields(item.type.progressFields),
                  }}
                  lists={lists}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
