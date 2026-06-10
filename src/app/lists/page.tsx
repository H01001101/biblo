import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import MyListsClient from "@/components/MyListsClient";

export default async function ListsPage() {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");

  const lists = await prisma.list.findMany({
    where: { ownerId: user.id },
    orderBy: { position: "asc" },
    include: {
      _count: { select: { items: true } },
      // Couverture = 1er élément (mieux noté, sinon le plus haut de la liste).
      items: {
        orderBy: [
          { rating: { sort: "desc", nulls: "last" } },
          { position: "asc" },
          { addedAt: "asc" },
        ],
        take: 1,
        select: { item: { select: { image: true } } },
      },
    },
  });

  return (
    <MyListsClient
      lists={lists.map((l) => ({
        id: l.id,
        name: l.name,
        hidden: l.hidden,
        count: l._count.items,
        cover: l.items[0]?.item.image || null,
      }))}
    />
  );
}
