import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { NATIVE_TYPES } from "../src/lib/progress";

// Initialisation d'une base de PRODUCTION propre :
//   - les 6 types d'éléments natifs (config de l'app, indispensables) ;
//   - un unique compte administrateur.
// Aucune donnée de démonstration. Idempotent (peut être relancé sans risque).
//
// Le mot de passe admin n'est JAMAIS écrit dans le code : il est lu depuis la
// variable d'environnement ADMIN_PASSWORD (et ADMIN_USERNAME, défaut "Admin").

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim() || "Admin";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD manquant. Lancez avec ADMIN_PASSWORD=... (et éventuellement ADMIN_USERNAME=...).",
    );
  }

  console.log("→ Types natifs…");
  for (const t of NATIVE_TYPES) {
    await prisma.itemType.upsert({
      where: { name: t.name },
      update: {
        isNative: true,
        statusTodo: t.statusTodo,
        statusInProgress: t.statusInProgress,
        statusDone: t.statusDone,
        progressFields: JSON.stringify(t.progressFields),
      },
      create: {
        name: t.name,
        isNative: true,
        statusTodo: t.statusTodo,
        statusInProgress: t.statusInProgress,
        statusDone: t.statusDone,
        progressFields: JSON.stringify(t.progressFields),
      },
    });
  }

  console.log(`→ Compte administrateur « ${username} »…`);
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { username },
    update: { passwordHash, role: "ADMIN" },
    create: { username, passwordHash, role: "ADMIN" },
  });

  const users = await prisma.user.count();
  const types = await prisma.itemType.count();
  console.log(`\n✅ Base de production prête : ${types} types, ${users} compte(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
