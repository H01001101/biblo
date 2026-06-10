import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NoImageIcon } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth";
import { getItemAverage, formatAvg } from "@/lib/queries";
import { parseProgressFields } from "@/lib/progress";
import AddToListForm from "@/components/AddToListForm";
import AdminItemEditor from "@/components/AdminItemEditor";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [item, user] = await Promise.all([
    prisma.item.findUnique({
      where: { id },
      include: {
        type: true,
        createdBy: { select: { username: true, role: true } },
      },
    }),
    getCurrentUser(),
  ]);

  if (!item || item.status !== "APPROVED") notFound();

  const isAdmin = user?.role === "ADMIN";

  const [{ avg, count }, lists, types] = await Promise.all([
    getItemAverage(item.id),
    user && !isAdmin
      ? prisma.list.findMany({
          where: { ownerId: user.id },
          orderBy: { position: "asc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    isAdmin
      ? prisma.itemType.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  // Créateur affiché discrètement, sauf si l'élément a été ajouté par un admin.
  const creator =
    item.createdBy && item.createdBy.role !== "ADMIN"
      ? item.createdBy.username
      : null;

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
            <div className="grid h-full place-items-center text-5xl text-[var(--color-muted)]/50"><NoImageIcon /></div>
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

          {creator && (
            <p className="mt-3 text-xs text-[var(--color-muted)]">
              Ajouté par {creator}
            </p>
          )}

          <div className="mt-6 max-w-md">
            {!user ? (
              <Link href="/login" className="btn-primary">
                Se connecter pour ajouter
              </Link>
            ) : isAdmin ? (
              <AdminItemEditor
                item={{
                  id: item.id,
                  name: item.name,
                  image: item.image,
                  description: item.description,
                  typeId: item.typeId,
                }}
                types={types}
              />
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
