import type { Metadata } from "next";
import { getRecentItems } from "@/lib/queries";
import ItemCard from "@/components/ItemCard";

export const metadata: Metadata = {
  title: "Nouveautés · Biblo",
};

export default async function NouveautesPage() {
  const items = await getRecentItems(30);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Nouveautés</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Les 30 derniers éléments ajoutés au catalogue.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card grid place-items-center gap-2 p-12 text-center">
          <p className="font-medium">Aucun élément pour l&apos;instant</p>
          <p className="text-sm text-[var(--color-muted)]">
            Les nouveaux éléments validés apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((c) => (
            <ItemCard key={c.id} {...c} from="nouveautes" />
          ))}
        </div>
      )}
    </div>
  );
}
