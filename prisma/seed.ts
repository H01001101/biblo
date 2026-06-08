import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { NATIVE_TYPES } from "../src/lib/progress";

const prisma = new PrismaClient();

// Petite image de couverture d'exemple (déterministe par "graine").
function cover(seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/300/450`;
}

async function main() {
  console.log("→ Création des types natifs…");
  const types: Record<string, string> = {};
  for (const t of NATIVE_TYPES) {
    const type = await prisma.itemType.upsert({
      where: { name: t.name },
      update: {},
      create: {
        name: t.name,
        isNative: true,
        statusTodo: t.statusTodo,
        statusInProgress: t.statusInProgress,
        statusDone: t.statusDone,
        progressFields: JSON.stringify(t.progressFields),
      },
    });
    types[t.name] = type.id;
  }

  console.log("→ Création des comptes…");
  const adminPass = await bcrypt.hash("admin123", 10);
  const userPass = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: { role: "ADMIN" },
    create: { username: "admin", passwordHash: adminPass, role: "ADMIN" },
  });

  const alice = await prisma.user.upsert({
    where: { username: "alice" },
    update: {},
    create: { username: "alice", passwordHash: userPass, role: "USER" },
  });

  const bob = await prisma.user.upsert({
    where: { username: "bob" },
    update: {},
    create: { username: "bob", passwordHash: userPass, role: "USER" },
  });

  console.log("→ Création du catalogue d'exemple…");
  // `by` = proposition acceptée d'un utilisateur (sinon ajout direct par l'admin).
  const catalog: {
    name: string;
    type: string;
    description: string;
    by?: "alice" | "bob";
  }[] = [
    { name: "One Piece", type: "Manga", description: "Les aventures de Luffy à la recherche du trésor légendaire, le One Piece.", by: "alice" },
    { name: "Berserk", type: "Manga", description: "Un sombre récit de fantasy médiévale suivant le mercenaire Guts.", by: "alice" },
    { name: "1984", type: "Livre", description: "Roman dystopique de George Orwell sur une société sous surveillance totale.", by: "alice" },
    { name: "Le Seigneur des Anneaux", type: "Livre", description: "L'épopée de Frodon pour détruire l'Anneau unique en Terre du Milieu." },
    { name: "Breaking Bad", type: "Série", description: "Un professeur de chimie devient fabricant de méthamphétamine.", by: "bob" },
    { name: "Game of Thrones", type: "Série", description: "Des familles nobles se disputent le Trône de Fer de Westeros.", by: "bob" },
    { name: "Inception", type: "Film", description: "Un voleur s'infiltre dans les rêves pour y dérober des secrets." },
    { name: "Le Voyage de Chihiro", type: "Film", description: "Une fillette se retrouve piégée dans un monde d'esprits." },
    { name: "Fullmetal Alchemist", type: "Anime", description: "Deux frères alchimistes cherchent à retrouver leurs corps.", by: "alice" },
    { name: "Attack on Titan", type: "Anime", description: "L'humanité lutte pour survivre face à des titans mangeurs d'hommes." },
    { name: "The Legend of Zelda: BOTW", type: "Jeu Vidéo", description: "Link explore un vaste royaume d'Hyrule en monde ouvert." },
    { name: "Hollow Knight", type: "Jeu Vidéo", description: "Un metroidvania exigeant dans le royaume insecte de Hallownest." },
  ];

  const creatorId = { alice: alice.id, bob: bob.id } as const;
  const createdItems: { id: string; name: string }[] = [];
  for (const c of catalog) {
    const item = await prisma.item.create({
      data: {
        name: c.name,
        description: c.description,
        image: cover(c.name),
        typeId: types[c.type],
        status: "APPROVED",
        createdById: c.by ? creatorId[c.by] : admin.id,
      },
    });
    createdItems.push({ id: item.id, name: item.name });
  }

  // Un élément en attente de validation (pour tester l'espace admin).
  await prisma.item.create({
    data: {
      name: "Chainsaw Man",
      description: "Denji fusionne avec son démon-tronçonneuse pour devenir un chasseur de démons.",
      image: cover("Chainsaw Man"),
      typeId: types["Manga"],
      status: "PENDING",
      createdById: alice.id,
    },
  });

  console.log("→ Création de listes et de notes d'exemple…");
  // Une liste pour Alice avec quelques éléments notés.
  const aliceList = await prisma.list.create({
    data: { name: "Mes mangas", ownerId: alice.id, position: 0 },
  });
  const aliceFilms = await prisma.list.create({
    data: { name: "Films vus", ownerId: alice.id, position: 1, hidden: true },
  });

  const onePiece = createdItems.find((i) => i.name === "One Piece")!;
  const berserk = createdItems.find((i) => i.name === "Berserk")!;
  const inception = createdItems.find((i) => i.name === "Inception")!;

  await prisma.listItem.create({
    data: {
      listId: aliceList.id,
      itemId: onePiece.id,
      rating: 9,
      status: "inProgress",
      progress: JSON.stringify({ progress: { unit: "Tome", value: 105 } }),
      position: 0,
    },
  });
  await prisma.listItem.create({
    data: {
      listId: aliceList.id,
      itemId: berserk.id,
      rating: 10,
      status: "done",
      position: 0,
    },
  });
  await prisma.listItem.create({
    data: {
      listId: aliceFilms.id,
      itemId: inception.id,
      rating: 8,
      status: "done",
      position: 0,
    },
  });

  // Bob note aussi One Piece pour que la moyenne ait du sens.
  const bobList = await prisma.list.create({
    data: { name: "Mangas de Bob", ownerId: bob.id, position: 0 },
  });
  await prisma.listItem.create({
    data: {
      listId: bobList.id,
      itemId: onePiece.id,
      rating: 7,
      status: "done",
      position: 0,
    },
  });

  // Alice et Bob sont amis.
  await prisma.friendship.create({
    data: { requesterId: alice.id, addresseeId: bob.id, status: "ACCEPTED" },
  });

  console.log("\n✅ Base remplie avec succès !");
  console.log("   Admin       → identifiant: admin  / mot de passe: admin123");
  console.log("   Utilisateur → identifiant: alice  / mot de passe: password123");
  console.log("   Utilisateur → identifiant: bob    / mot de passe: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
