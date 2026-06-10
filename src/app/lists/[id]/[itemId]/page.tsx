import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NoImageIcon } from "@/components/icons";
import { requireUser } from "@/lib/auth";
import { getItemAverage, formatAvg } from "@/lib/queries";
import {
  parseProgressFields,
  parseProgressValues,
  statusLabel,
  formatProgress,
} from "@/lib/progress";

// Page détaillée d'un élément CONSULTÉ DEPUIS UNE LISTE.
// Différences avec la page catalogue : on montre la note personnelle de
// l'utilisateur (en plus de la moyenne), pas de bouton "Ajouter", et le
// retour se fait vers la liste.
export default async function ListItemDetailPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId } = await params;
  const user = await requireUser();

  // La liste doit appartenir à l'utilisateur et contenir l'élément.
  const listItem = await prisma.listItem.findFirst({
    where: { itemId, listId: id, list: { ownerId: user.id } },
    include: {
      list: { select: { id: true, name: true } },
      item: {
        include: {
          type: true,
          createdBy: { select: { username: true, role: true } },
        },
      },
    },
  });

  if (!listItem) notFound();

  const { item } = listItem;
  const { avg, count } = await getItemAverage(item.id);

  const fields = parseProgressFields(item.type.progressFields);
  const progressText =
    listItem.status === "inProgress"
      ? formatProgress(fields, parseProgressValues(listItem.progress))
      : "";

  return (
    <div>
      <Link
        href={`/lists/${listItem.list.id}`}
        className="mb-4 inline-flex text-sm text-[var(--color-muted)] hover:underline"
      >
        ← Retour à la liste "{listItem.list.name}"
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

          {/* Notes : moyenne + note personnelle */}
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="card px-4 py-2">
              <div className="text-xs text-[var(--color-muted)]">Note moyenne</div>
              <div className="text-lg font-semibold">
                <span className="text-amber-500">★</span> {formatAvg(avg)}
                <span className="ml-1 text-xs font-normal text-[var(--color-muted)]">
                  {count > 0 ? `(${count})` : "(non noté)"}
                </span>
              </div>
            </div>
            <div className="card px-4 py-2">
              <div className="text-xs text-[var(--color-muted)]">Ma note</div>
              <div className="text-lg font-semibold">
                {listItem.rating == null ? "—" : `${listItem.rating} / 10`}
              </div>
            </div>
            <div className="card px-4 py-2">
              <div className="text-xs text-[var(--color-muted)]">Avancement</div>
              <div className="text-lg font-semibold">
                {statusLabel(item.type, listItem.status)}
                {progressText && (
                  <span className="ml-1 text-sm font-normal text-[var(--color-muted)]">
                    · {progressText}
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">
            {item.description || "Aucune description."}
          </p>

          {item.createdBy && item.createdBy.role !== "ADMIN" && (
            <p className="mt-3 text-xs text-[var(--color-muted)]">
              Ajouté par {item.createdBy.username}
            </p>
          )}

          <div className="mt-6">
            <Link href={`/lists/${listItem.list.id}`} className="btn-secondary">
              ← Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
