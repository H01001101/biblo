import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { parseProgressFields } from "@/lib/progress";
import ListDetailClient, {
  type ListItemRow,
} from "@/components/ListDetailClient";

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const list = await prisma.list.findFirst({
    where: { id, ownerId: user.id },
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

  const rows: ListItemRow[] = list.items.map((li) => ({
    listItemId: li.id,
    itemId: li.itemId,
    name: li.item.name,
    image: li.item.image,
    rating: li.rating,
    status: li.status,
    progress: li.progress,
    type: {
      statusTodo: li.item.type.statusTodo,
      statusInProgress: li.item.type.statusInProgress,
      statusDone: li.item.type.statusDone,
      progressFields: parseProgressFields(li.item.type.progressFields),
    },
  }));

  return (
    <ListDetailClient
      list={{ id: list.id, name: list.name, hidden: list.hidden }}
      rows={rows}
    />
  );
}
