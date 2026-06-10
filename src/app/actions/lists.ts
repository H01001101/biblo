"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

async function requireListOwner(listId: string) {
  const user = await requireUser();
  const list = await prisma.list.findFirst({
    where: { id: listId, ownerId: user.id },
  });
  if (!list) redirect("/lists");
  return { user, list };
}

// Enregistre l'ordre des listes de l'utilisateur (glisser-déposer).
export async function reorderLists(orderedIds: string[]) {
  const user = await requireUser();
  const owned = await prisma.list.findMany({
    where: { ownerId: user.id },
    select: { id: true },
  });
  const valid = new Set(owned.map((l) => l.id));
  const ids = orderedIds.filter((id) => valid.has(id));
  if (ids.length === 0) return;

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.list.update({ where: { id }, data: { position: index } }),
    ),
  );
  revalidatePath("/lists");
}

export async function createList(formData: FormData) {
  const user = await requireUser();
  if (user.role === "ADMIN") return;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const count = await prisma.list.count({ where: { ownerId: user.id } });
  await prisma.list.create({
    data: { name, ownerId: user.id, position: count },
  });
  revalidatePath("/lists");
}

export async function renameList(formData: FormData) {
  const listId = String(formData.get("listId") ?? "");
  await requireListOwner(listId);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await prisma.list.update({ where: { id: listId }, data: { name } });
  revalidatePath("/lists");
  revalidatePath(`/lists/${listId}`);
}

export async function deleteList(formData: FormData) {
  const listId = String(formData.get("listId") ?? "");
  await requireListOwner(listId);
  await prisma.list.delete({ where: { id: listId } });
  revalidatePath("/lists");
  redirect("/lists");
}

export async function toggleListHidden(formData: FormData) {
  const listId = String(formData.get("listId") ?? "");
  const { list } = await requireListOwner(listId);
  await prisma.list.update({
    where: { id: listId },
    data: { hidden: !list.hidden },
  });
  revalidatePath("/lists");
  revalidatePath(`/lists/${listId}`);
}

export async function updateListItem(formData: FormData) {
  const user = await requireUser();
  const listItemId = String(formData.get("listItemId") ?? "");
  const li = await prisma.listItem.findFirst({
    where: { id: listItemId, list: { ownerId: user.id } },
  });
  if (!li) return;

  const ratingRaw = String(formData.get("rating") ?? "").trim();
  const rating =
    ratingRaw === "" ? null : Math.max(0, Math.min(10, Number(ratingRaw)));
  const status = String(formData.get("status") ?? li.status);
  const progress = String(formData.get("progress") ?? "").trim() || null;

  await prisma.listItem.update({
    where: { id: listItemId },
    data: { rating, status, progress },
  });
  revalidatePath(`/lists/${li.listId}`);
}

export async function removeListItem(formData: FormData) {
  const user = await requireUser();
  const listItemId = String(formData.get("listItemId") ?? "");
  const li = await prisma.listItem.findFirst({
    where: { id: listItemId, list: { ownerId: user.id } },
  });
  if (!li) return;
  await prisma.listItem.delete({ where: { id: listItemId } });
  revalidatePath(`/lists/${li.listId}`);
}

// Enregistre un nouvel ordre complet de la liste (glisser-déposer).
// On reçoit la liste ordonnée des identifiants de ListItem ; on leur attribue
// des positions séquentielles. Le tri global restant (note décroissante puis
// position) reste cohérent puisque l'ordre fourni est déjà trié par note.
export async function reorderListItems(listId: string, orderedIds: string[]) {
  const user = await requireUser();
  const list = await prisma.list.findFirst({
    where: { id: listId, ownerId: user.id },
    include: { items: { select: { id: true } } },
  });
  if (!list) return;

  // Sécurité : on ne garde que les identifiants appartenant réellement à la liste.
  const valid = new Set(list.items.map((i) => i.id));
  const ids = orderedIds.filter((id) => valid.has(id));
  if (ids.length === 0) return;

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.listItem.update({ where: { id }, data: { position: index } }),
    ),
  );
  revalidatePath(`/lists/${listId}`);
}

// Déplace un élément vers le haut/bas parmi les éléments de MÊME note.
export async function moveListItem(formData: FormData) {
  const user = await requireUser();
  const listItemId = String(formData.get("listItemId") ?? "");
  const direction = String(formData.get("direction") ?? "");

  const target = await prisma.listItem.findFirst({
    where: { id: listItemId, list: { ownerId: user.id } },
  });
  if (!target) return;

  // Ordre courant de la liste : note décroissante puis position puis date.
  const all = await prisma.listItem.findMany({
    where: { listId: target.listId },
    orderBy: [
      { rating: { sort: "desc", nulls: "last" } },
      { position: "asc" },
      { addedAt: "asc" },
    ],
  });

  // On renumérote proprement les positions (0..n-1) pour pouvoir échanger.
  for (let i = 0; i < all.length; i++) all[i].position = i;

  const idx = all.findIndex((x) => x.id === listItemId);
  const neighborIdx = direction === "up" ? idx - 1 : idx + 1;
  const neighbor = all[neighborIdx];

  // On n'autorise l'échange qu'entre éléments de même note.
  if (neighbor && neighbor.rating === target.rating) {
    const tmp = all[idx].position;
    all[idx].position = neighbor.position;
    neighbor.position = tmp;
  }

  await prisma.$transaction(
    all.map((x) =>
      prisma.listItem.update({
        where: { id: x.id },
        data: { position: x.position },
      }),
    ),
  );
  revalidatePath(`/lists/${target.listId}`);
}
