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

// Normalise un texte pour la recherche : minuscules, sans accents, sans
// espaces ni ponctuation. Ainsi "One Piece" et "onepiece" deviennent identiques.
function normalizeForSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

// Score de correspondance entre une requête et un nom (tous deux normalisés).
// Plus c'est petit, mieux c'est. null = pas de correspondance.
// - sous-chaîne exacte : score = position (0, 1, …)
// - sinon sous-séquence (lettres dans l'ordre, fautes/lettres manquantes
//   tolérées) : score 1000 + largeur de la correspondance (plus serré = mieux).
function trigrams(s: string): Set<string> {
  const padded = `  ${s}  `;
  const g = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) g.add(padded.slice(i, i + 3));
  return g;
}

function searchScore(qnorm: string, nnorm: string): number | null {
  if (!qnorm) return 0;

  // 1) Sous-chaîne exacte (recherche partielle) — meilleur score.
  const idx = nnorm.indexOf(qnorm);
  if (idx >= 0) return idx;

  // 2) Sous-séquence (lettres dans l'ordre : espaces/lettres manquants tolérés).
  let i = 0;
  let first = -1;
  let last = -1;
  for (let j = 0; j < nnorm.length && i < qnorm.length; j++) {
    if (nnorm[j] === qnorm[i]) {
      if (first < 0) first = j;
      last = j;
      i++;
    }
  }
  if (i === qnorm.length) return 1000 + (last - first);

  // 3) Tolérance aux fautes (trigrammes) pour les requêtes un peu longues :
  //    gère les inversions de lettres et coquilles (ex: "centruy" -> "century").
  if (qnorm.length >= 4) {
    const qg = trigrams(qnorm);
    const ng = trigrams(nnorm);
    let inter = 0;
    for (const g of qg) if (ng.has(g)) inter++;
    const containment = inter / qg.size;
    if (containment >= 0.5) return 2000 + Math.round((1 - containment) * 1000);
  }

  return null;
}

// Récupère le catalogue (éléments validés) avec moyenne des notes,
// filtré par type / note minimale / recherche, puis paginé.
export async function getCatalog(opts: {
  typeId?: string;
  minNote?: number;
  q?: string;
  page?: number;
}): Promise<CatalogResult> {
  const items = await prisma.item.findMany({
    where: {
      status: "APPROVED",
      ...(opts.typeId ? { typeId: opts.typeId } : {}),
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

  // Recherche tolérante (espaces manquants, fautes de frappe), classée par
  // pertinence. Catalogue de taille modeste -> calcul en mémoire.
  const qnorm = normalizeForSearch(opts.q ?? "");
  if (qnorm) {
    cards = cards
      .map((c) => ({ c, s: searchScore(qnorm, normalizeForSearch(c.name)) }))
      .filter((x): x is { c: CatalogCard; s: number } => x.s !== null)
      .sort((a, b) => a.s - b.s || a.c.name.localeCompare(b.c.name))
      .map((x) => x.c);
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
