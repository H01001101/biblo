"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sanitizeProgressFields } from "@/lib/progress";

export type TypeActionState = { error?: string; success?: string };

function readTypeForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    statusTodo: String(formData.get("statusTodo") ?? "").trim(),
    statusInProgress: String(formData.get("statusInProgress") ?? "").trim(),
    statusDone: String(formData.get("statusDone") ?? "").trim(),
    progressFields: sanitizeProgressFields(
      String(formData.get("progressFields") ?? "[]"),
    ),
  };
}

function validate(d: ReturnType<typeof readTypeForm>): string | null {
  if (d.name.length < 2) return "Le nom du type doit faire au moins 2 caractères.";
  if (!d.statusTodo || !d.statusInProgress || !d.statusDone) {
    return "Renseigne les trois libellés d'avancement (à faire / en cours / terminé).";
  }
  return null;
}

function revalidateTypes() {
  revalidatePath("/admin/types");
  revalidatePath("/item/new");
  revalidatePath("/");
}

export async function adminCreateType(
  _prev: TypeActionState,
  formData: FormData,
): Promise<TypeActionState> {
  await requireAdmin();
  const d = readTypeForm(formData);
  const err = validate(d);
  if (err) return { error: err };

  const exists = await prisma.itemType.findUnique({ where: { name: d.name } });
  if (exists) return { error: "Un type portant ce nom existe déjà." };

  await prisma.itemType.create({
    data: {
      name: d.name,
      isNative: false,
      statusTodo: d.statusTodo,
      statusInProgress: d.statusInProgress,
      statusDone: d.statusDone,
      progressFields: JSON.stringify(d.progressFields),
    },
  });
  revalidateTypes();
  return { success: `Type "${d.name}" créé.` };
}

export async function adminUpdateType(
  _prev: TypeActionState,
  formData: FormData,
): Promise<TypeActionState> {
  await requireAdmin();
  const typeId = String(formData.get("typeId") ?? "");
  const d = readTypeForm(formData);
  const err = validate(d);
  if (err) return { error: err };

  const clash = await prisma.itemType.findFirst({
    where: { name: d.name, NOT: { id: typeId } },
  });
  if (clash) return { error: "Un autre type porte déjà ce nom." };

  await prisma.itemType.update({
    where: { id: typeId },
    data: {
      name: d.name,
      statusTodo: d.statusTodo,
      statusInProgress: d.statusInProgress,
      statusDone: d.statusDone,
      progressFields: JSON.stringify(d.progressFields),
    },
  });
  revalidateTypes();
  return { success: "Type mis à jour." };
}

// Suppression d'un type. Bloquée si des éléments l'utilisent encore
// (la page n'affiche le bouton que dans ce cas, mais on re-vérifie ici).
export async function adminDeleteType(formData: FormData) {
  await requireAdmin();
  const typeId = String(formData.get("typeId") ?? "");
  const count = await prisma.item.count({ where: { typeId } });
  if (count > 0) return;
  await prisma.itemType.delete({ where: { id: typeId } });
  revalidateTypes();
}
