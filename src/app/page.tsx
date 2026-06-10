import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCatalog } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import CatalogFilters from "@/components/CatalogFilters";
import CatalogPagination from "@/components/CatalogPagination";
import ItemCard from "@/components/ItemCard";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const typeId = typeof sp.type === "string" ? sp.type : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const minNote = typeof sp.note === "string" ? Number(sp.note) : undefined;
  const page = typeof sp.page === "string" ? Number(sp.page) : 1;

  const [user, types, catalog] = await Promise.all([
    getCurrentUser(),
    prisma.itemType.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getCatalog({ typeId, q, minNote, page }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Catalogue</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Parcours les éléments et ajoute-les à tes listes
          </p>
        </div>
        {user ? (
          <Link href="/item/new" className="btn-primary">
            + Créer un élément
          </Link>
        ) : (
          <Link href="/login" className="btn-secondary">
            Connecte-toi pour créer un élément
          </Link>
        )}
      </div>

      {sp.submitted === "1" && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Merci ! Ton élément a été envoyé et sera visible une fois validé par
          l'admin
        </div>
      )}

      <CatalogFilters types={types} />

      {catalog.cards.length === 0 ? (
        <div className="card grid place-items-center gap-2 p-12 text-center">
          <p className="font-medium">Aucun élément trouvé</p>
          <p className="text-sm text-[var(--color-muted)]">
            Essaie de modifier les filtres, ou crée l&apos;élément manquant
          </p>
        </div>
      ) : (
        <>
          {catalog.totalPages > 1 && (
            <div className="mb-4">
              <CatalogPagination
                page={catalog.page}
                totalPages={catalog.totalPages}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {catalog.cards.map((c) => (
              <ItemCard key={c.id} {...c} />
            ))}
          </div>

          {catalog.totalPages > 1 && (
            <div className="mt-8">
              <CatalogPagination
                page={catalog.page}
                totalPages={catalog.totalPages}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
