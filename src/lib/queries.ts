import "server-only";
import { prisma } from "@/lib/prisma";

export const PAGE_SIZE = 30; // 3 colonnes x 10 lignes

export type CatalogCard = {
  id: string;
  name: string;
  image: string;
  typeName: string;
  avg: number | null; // note moyenne (null si personne n'a noté)
  ratingsCount: number;
};

export type CatalogResult = {
  cards: CatalogCard[];
  page: number;
  totalPages: number;
  total: number;
};

// Récupère le catalogue (éléments validés) avec moyenne des notes,
// filtré par type / note minimale / recherche, puis paginé.
export async function getCatalog(opts: {
  typeId?: string;
  minNote?: number;
  q?: string;
  page?: number;
}): Promise<CatalogResult> {
  // Recherche permissive : insensible à la casse, par mots (chaque mot doit
  // apparaître quelque part dans le nom, dans n'importe quel ordre).
  const words = (opts.q ?? "").trim().split(/\s+/).filter(Boolean);

  const items = await prisma.item.findMany({
    where: {
      status: "APPROVED",
      ...(opts.typeId ? { typeId: opts.typeId } : {}),
      ...(words.length
        ? {
            AND: words.map((w) => ({
              name: { contains: w, mode: "insensitive" as const },
            })),
          }
        : {}),
    },
    include: {
      type: { select: { name: true } },
      listItems: { select: { rating: true } },
    },
    orderBy: { name: "asc" },
  });

  let cards: CatalogCard[] = items.map((item) => {
    const ratings = item.listItems
      .map((li) => li.rating)
      .filter((r): r is number => r != null);
    const avg =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;
    return {
      id: item.id,
      name: item.name,
      image: item.image,
      typeName: item.type.name,
      avg,
      ratingsCount: ratings.length,
    };
  });

  if (opts.minNote && opts.minNote > 0) {
    cards = cards.filter((c) => c.avg != null && c.avg >= opts.minNote!);
  }

  const total = cards.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, opts.page ?? 1), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  cards = cards.slice(start, start + PAGE_SIZE);

  return { cards, page, totalPages, total };
}

// Les N éléments les plus récemment ajoutés au catalogue (validés).
export async function getRecentItems(limit = 30): Promise<CatalogCard[]> {
  const items = await prisma.item.findMany({
    where: { status: "APPROVED" },
    include: {
      type: { select: { name: true } },
      listItems: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return items.map((item) => {
    const ratings = item.listItems
      .map((li) => li.rating)
      .filter((r): r is number => r != null);
    const avg =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;
    return {
      id: item.id,
      name: item.name,
      image: item.image,
      typeName: item.type.name,
      avg,
      ratingsCount: ratings.length,
    };
  });
}

// Moyenne des notes d'un élément précis.
export async function getItemAverage(
  itemId: string,
): Promise<{ avg: number | null; count: number }> {
  const ratings = await prisma.listItem.findMany({
    where: { itemId, rating: { not: null } },
    select: { rating: true },
  });
  const values = ratings.map((r) => r.rating!) as number[];
  const avg =
    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
  return { avg, count: values.length };
}

export function formatAvg(avg: number | null): string {
  if (avg == null) return "—";
  return avg.toFixed(1).replace(/\.0$/, "");
}

// Top des utilisateurs ayant le plus de propositions d'éléments ACCEPTÉES
// (créées par eux et validées par un admin, donc présentes au catalogue).
// Les administrateurs ajoutent directement sans proposition : on les exclut.
export async function getTopContributors(
  limit = 3,
): Promise<{ username: string; count: number }[]> {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: {
      username: true,
      _count: { select: { createdItems: { where: { status: "APPROVED" } } } },
    },
  });

  return users
    .map((u) => ({ username: u.username, count: u._count.createdItems }))
    .filter((u) => u.count > 0)
    .sort((a, b) => b.count - a.count || a.username.localeCompare(b.username))
    .slice(0, limit);
}
