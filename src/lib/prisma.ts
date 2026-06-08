import { PrismaClient } from "@/generated/prisma/client";

// On réutilise une seule instance du client Prisma (évite d'ouvrir trop de
// connexions lors des rechargements à chaud en développement).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
