import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import CreateItemForm from "@/components/CreateItemForm";

export default async function NewItemPage() {
  const user = await requireUser();
  const types = await prisma.itemType.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold">Créer un élément</h1>
      <p className="mb-6 text-sm text-[var(--color-muted)]">
        Ajoute un élément absent du catalogue
      </p>
      <CreateItemForm types={types} isAdmin={user.role === "ADMIN"} />
    </div>
  );
}
