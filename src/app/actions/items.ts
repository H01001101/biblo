"use server";

import { writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { put } from "@vercel/blob";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/auth";
import { sanitizeProgressFields } from "@/lib/progress";

export type ActionState = { error?: string; ok?: boolean };

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

// Jeton Vercel Blob : on accepte le nom standard ou un préfixe personnalisé
// (selon le préfixe choisi à la création du store, ex: "biblo_READ_WRITE_TOKEN").
function getBlobToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const key = Object.keys(process.env).find((k) =>
    k.endsWith("_READ_WRITE_TOKEN"),
  );
  return key ? process.env[key] : undefined;
}

// Enregistre une image envoyée en fichier et renvoie son URL.
// - En production (Vercel) : envoi vers Vercel Blob si un jeton Blob est défini.
// - En local (sans jeton) : écriture dans public/uploads.
// Si aucun fichier valide, on retombe sur l'URL éventuellement fournie.
async function resolveImage(formData: FormData): Promise<string> {
  const file = formData.get("imageFile");
  const urlFallback = String(formData.get("image") ?? "").trim();

  if (file instanceof File && file.size > 0) {
    if (file.size > 1 * 1024 * 1024) {
      throw new Error("L'image ne doit pas dépasser 1 Mo.");
    }
    const ext = EXT_BY_TYPE[file.type];
    if (!ext) {
      throw new Error("Format d'image non supporté (png, jpg, webp, gif, avif).");
    }
    const name = `${crypto.randomUUID()}.${ext}`;

    const blobToken = getBlobToken();
    if (blobToken) {
      const blob = await put(`uploads/${name}`, file, {
        access: "public",
        token: blobToken,
      });
      return blob.url;
    }

    // Repli local (développement) : disque dans public/uploads.
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(process.cwd(), "public", "uploads", name), buffer);
    return `/uploads/${name}`;
  }

  return urlFallback;
}

// Création d'un élément (par un utilisateur -> en attente, par un admin -> validé).
// Permet aussi de créer un nouveau type d'élément à la volée.
export async function createItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const typeMode = String(formData.get("typeMode") ?? "existing");

  if (name.length < 2) {
    return { error: "Le nom doit faire au moins 2 caractères." };
  }

  let image: string;
  try {
    image = await resolveImage(formData);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image invalide." };
  }

  let typeId: string;

  if (typeMode === "new") {
    const newTypeName = String(formData.get("newTypeName") ?? "").trim();
    const statusTodo = String(formData.get("statusTodo") ?? "").trim();
    const statusInProgress = String(formData.get("statusInProgress") ?? "").trim();
    const statusDone = String(formData.get("statusDone") ?? "").trim();
    const progressFields = sanitizeProgressFields(
      String(formData.get("progressFields") ?? "[]"),
    );

    if (!newTypeName || !statusTodo || !statusInProgress || !statusDone) {
      return {
        error:
          "Pour un nouveau type, renseignez son nom et les trois libellés d'avancement.",
      };
    }
    const exists = await prisma.itemType.findUnique({
      where: { name: newTypeName },
    });
    if (exists) {
      return { error: "Un type portant ce nom existe déjà." };
    }
    const type = await prisma.itemType.create({
      data: {
        name: newTypeName,
        isNative: false,
        statusTodo,
        statusInProgress,
        statusDone,
        progressFields: JSON.stringify(progressFields),
      },
    });
    typeId = type.id;
  } else {
    typeId = String(formData.get("typeId") ?? "");
    const type = await prisma.itemType.findUnique({ where: { id: typeId } });
    if (!type) return { error: "Veuillez choisir un type valide." };
  }

  const isAdmin = user.role === "ADMIN";
  await prisma.item.create({
    data: {
      name,
      image,
      description,
      typeId,
      status: isAdmin ? "APPROVED" : "PENDING",
      createdById: user.id,
    },
  });

  revalidatePath("/");
  redirect(isAdmin ? "/" : "/?submitted=1");
}

// Ajoute (ou met à jour) un élément dans une liste de l'utilisateur.
export async function addToList(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  if (user.role === "ADMIN") {
    return { error: "Les administrateurs ne peuvent pas gérer de listes." };
  }

  const itemId = String(formData.get("itemId") ?? "");
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item || item.status !== "APPROVED") {
    return { error: "Élément introuvable." };
  }

  // Liste cible : existante ou nouvelle.
  let listId = String(formData.get("listId") ?? "");
  const newListName = String(formData.get("newListName") ?? "").trim();
  if (listId === "__new__" || (!listId && newListName)) {
    if (!newListName) return { error: "Donnez un nom à la nouvelle liste." };
    const count = await prisma.list.count({ where: { ownerId: user.id } });
    const list = await prisma.list.create({
      data: { name: newListName, ownerId: user.id, position: count },
    });
    listId = list.id;
  }
  const list = await prisma.list.findFirst({
    where: { id: listId, ownerId: user.id },
  });
  if (!list) return { error: "Liste introuvable." };

  const ratingRaw = String(formData.get("rating") ?? "").trim();
  const rating = ratingRaw === "" ? null : Math.max(0, Math.min(10, Number(ratingRaw)));
  const status = String(formData.get("status") ?? "todo");
  const progress = String(formData.get("progress") ?? "").trim() || null;

  await prisma.listItem.upsert({
    where: { listId_itemId: { listId, itemId } },
    update: { rating, status, progress },
    create: { listId, itemId, rating, status, progress, position: 0 },
  });

  revalidatePath(`/lists/${listId}`);
  revalidatePath(`/item/${itemId}`);
  redirect(`/lists/${listId}`);
}

// --- Modération (administrateur) ---

export async function moderateItem(formData: FormData) {
  await requireAdmin();
  const itemId = String(formData.get("itemId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  if (decision === "reject") {
    await prisma.item.update({
      where: { id: itemId },
      data: { status: "REJECTED" },
    });
  } else if (decision === "approve") {
    // L'admin peut corriger les champs avant de valider.
    const name = String(formData.get("name") ?? "").trim();
    const image = String(formData.get("image") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const typeId = String(formData.get("typeId") ?? "");
    await prisma.item.update({
      where: { id: itemId },
      data: {
        ...(name ? { name } : {}),
        image,
        description,
        ...(typeId ? { typeId } : {}),
        status: "APPROVED",
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

// Modification d'un élément déjà au catalogue (administrateur).
// Si aucune nouvelle image n'est fournie, on conserve l'image actuelle
// (le formulaire pré-remplit le champ URL avec l'image existante).
export async function adminUpdateItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const itemId = String(formData.get("itemId") ?? "");
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) return { error: "Élément introuvable." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const typeId = String(formData.get("typeId") ?? "");
  if (name.length < 2) {
    return { error: "Le nom doit faire au moins 2 caractères." };
  }

  let image: string;
  try {
    image = await resolveImage(formData);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image invalide." };
  }

  await prisma.item.update({
    where: { id: itemId },
    data: { name, description, image, ...(typeId ? { typeId } : {}) },
  });

  revalidatePath("/");
  revalidatePath(`/item/${itemId}`);
  return { ok: true };
}

// Suppression d'un élément du catalogue (administrateur).
// Cascade : l'élément est aussi retiré de toutes les listes des utilisateurs.
export async function adminDeleteItem(formData: FormData) {
  await requireAdmin();
  const itemId = String(formData.get("itemId") ?? "");
  await prisma.item.delete({ where: { id: itemId } });
  revalidatePath("/");
  redirect("/");
}
