"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type FriendState = { error?: string; success?: string };

export async function sendFriendRequest(
  _prev: FriendState,
  formData: FormData,
): Promise<FriendState> {
  const me = await requireUser();
  if (me.role === "ADMIN") return { error: "Action réservée aux utilisateurs." };

  const username = String(formData.get("username") ?? "").trim();
  if (!username) return { error: "Indiquez un nom d'utilisateur." };
  if (username === me.username) {
    return { error: "Tu ne peux pas t'ajouter toi-même." };
  }

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target || target.role === "ADMIN") {
    return { error: "Aucun utilisateur trouvé avec ce nom." };
  }

  // Une relation existe-t-elle déjà dans un sens ou l'autre ?
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: me.id, addresseeId: target.id },
        { requesterId: target.id, addresseeId: me.id },
      ],
    },
  });
  if (existing) {
    return {
      error:
        existing.status === "ACCEPTED"
          ? "Tu es déjà ami avec cette personne."
          : "Une demande est déjà en attente.",
    };
  }

  await prisma.friendship.create({
    data: { requesterId: me.id, addresseeId: target.id, status: "PENDING" },
  });
  revalidatePath("/profile");
  return { success: `Demande envoyée à ${username}.` };
}

export async function acceptFriendRequest(formData: FormData) {
  const me = await requireUser();
  const id = String(formData.get("friendshipId") ?? "");
  await prisma.friendship.updateMany({
    where: { id, addresseeId: me.id, status: "PENDING" },
    data: { status: "ACCEPTED" },
  });
  revalidatePath("/profile");
}

export async function rejectFriendRequest(formData: FormData) {
  const me = await requireUser();
  const id = String(formData.get("friendshipId") ?? "");
  await prisma.friendship.deleteMany({
    where: { id, addresseeId: me.id, status: "PENDING" },
  });
  revalidatePath("/profile");
}

export async function removeFriend(formData: FormData) {
  const me = await requireUser();
  const id = String(formData.get("friendshipId") ?? "");
  await prisma.friendship.deleteMany({
    where: {
      id,
      OR: [{ requesterId: me.id }, { addresseeId: me.id }],
    },
  });
  revalidatePath("/profile");
}
