"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type ProfileState = { error?: string; success?: string };

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,20}$/;

export async function changeUsername(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const me = await requireUser();
  const username = String(formData.get("username") ?? "").trim();

  if (!USERNAME_RE.test(username)) {
    return { error: "Nom invalide (3 à 20 caractères : lettres, chiffres, _ . -)." };
  }
  if (username === me.username) {
    return { error: "C'est déjà ton nom d'utilisateur." };
  }
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: "Ce nom d'utilisateur est déjà pris." };

  await prisma.user.update({ where: { id: me.id }, data: { username } });
  revalidatePath("/profile");
  return { success: "Nom d'utilisateur mis à jour." };
}

export async function setTheme(formData: FormData) {
  const me = await requireUser();
  const theme = String(formData.get("theme") ?? "light") === "dark" ? "dark" : "light";
  await prisma.user.update({ where: { id: me.id }, data: { theme } });
  revalidatePath("/", "layout");
}

export async function setUiStyle(formData: FormData) {
  const me = await requireUser();
  const uiStyle =
    String(formData.get("uiStyle") ?? "modern") === "classic" ? "classic" : "modern";
  await prisma.user.update({ where: { id: me.id }, data: { uiStyle } });
  revalidatePath("/", "layout");
}

const INTERFACE_THEMES = ["none", "medieval", "pixel", "win2000", "onepiece"];

export async function setInterfaceTheme(formData: FormData) {
  const me = await requireUser();
  const raw = String(formData.get("interfaceTheme") ?? "none");
  const interfaceTheme = INTERFACE_THEMES.includes(raw) ? raw : "none";
  await prisma.user.update({ where: { id: me.id }, data: { interfaceTheme } });
  revalidatePath("/", "layout");
}

export async function changePassword(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const me = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
    return { error: "Mot de passe actuel incorrect." };
  }
  if (next.length < 6) {
    return { error: "Le nouveau mot de passe doit faire au moins 6 caractères." };
  }
  if (next !== confirm) {
    return { error: "Les deux nouveaux mots de passe ne correspondent pas." };
  }

  const passwordHash = await bcrypt.hash(next, 10);
  await prisma.user.update({ where: { id: me.id }, data: { passwordHash } });
  return { success: "Mot de passe mis à jour." };
}
