import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export type CurrentUser = {
  id: string;
  username: string;
  role: string;
  theme: string;
  uiStyle: string;
  interfaceTheme: string;
};

// Renvoie l'utilisateur connecté, ou null.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      role: true,
      theme: true,
      uiStyle: true,
      interfaceTheme: true,
    },
  });
  return user;
}

// Exige un utilisateur connecté ; redirige vers /login sinon.
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// Exige un administrateur ; redirige sinon.
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

export function isAdmin(user: CurrentUser | null): boolean {
  return user?.role === "ADMIN";
}
