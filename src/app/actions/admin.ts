"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type AdminState = { error?: string; success?: string };

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,20}$/;

export async function adminCreateUser(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "USER") === "ADMIN" ? "ADMIN" : "USER";

  if (!USERNAME_RE.test(username)) {
    return { error: "Nom invalide (3 à 20 caractères)." };
  }
  if (password.length < 6) {
    return { error: "Le mot de passe doit faire au moins 6 caractères." };
  }
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: "Ce nom d'utilisateur est déjà pris." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { username, passwordHash, role } });
  revalidatePath("/admin/users");
  return { success: `Compte « ${username} » créé.` };
}

export async function adminUpdateUser(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const role = String(formData.get("role") ?? "USER") === "ADMIN" ? "ADMIN" : "USER";
  const newPassword = String(formData.get("newPassword") ?? "");

  if (!USERNAME_RE.test(username)) return;

  // Évite les collisions de nom avec un autre compte.
  const clash = await prisma.user.findFirst({
    where: { username, NOT: { id: userId } },
  });
  if (clash) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      username,
      role,
      ...(newPassword.length >= 6
        ? { passwordHash: await bcrypt.hash(newPassword, 10) }
        : {}),
    },
  });
  revalidatePath("/admin/users");
}

export async function adminDeleteUser(formData: FormData) {
  const me = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (userId === me.id) return; // un admin ne se supprime pas lui-même
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}
