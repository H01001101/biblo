// Définition de la façon dont on mesure l'avancement d'un élément "En cours".
//
// Chaque type d'élément possède une liste de "champs de progression" (progressFields).
// Deux genres de champs :
//   - "number"      : un simple nombre avec un libellé (ex: Saison, Épisode, Heure...)
//   - "unit-number" : l'utilisateur choisit une unité puis saisit un nombre
//                     (ex: manga -> Tome OU Chapitre, puis le numéro)

export type ProgressField =
  | { kind: "number"; key: string; label: string }
  | { kind: "unit-number"; key: string; label: string; units: string[] };

// Valeurs saisies par l'utilisateur, stockées en JSON sur le ListItem.
// number       -> { [key]: number }
// unit-number  -> { [key]: { unit: string, value: number } }
export type ProgressValues = Record<
  string,
  number | { unit: string; value: number }
>;

export const STATUS_KEYS = ["todo", "inProgress", "done"] as const;
export type StatusKey = (typeof STATUS_KEYS)[number];

// Les 6 types natifs du site, avec leurs libellés d'état et champs de progression.
export const NATIVE_TYPES: {
  name: string;
  statusTodo: string;
  statusInProgress: string;
  statusDone: string;
  progressFields: ProgressField[];
}[] = [
  {
    name: "Manga",
    statusTodo: "À lire",
    statusInProgress: "En cours",
    statusDone: "Lu",
    progressFields: [
      { kind: "unit-number", key: "progress", label: "Progression", units: ["Tome", "Chapitre"] },
    ],
  },
  {
    name: "Livre",
    statusTodo: "À lire",
    statusInProgress: "En cours",
    statusDone: "Lu",
    progressFields: [
      { kind: "unit-number", key: "progress", label: "Progression", units: ["Page", "Chapitre"] },
    ],
  },
  {
    name: "Série",
    statusTodo: "À voir",
    statusInProgress: "En cours",
    statusDone: "Vu",
    progressFields: [
      { kind: "number", key: "saison", label: "Saison" },
      { kind: "number", key: "episode", label: "Épisode" },
    ],
  },
  {
    name: "Film",
    statusTodo: "À voir",
    statusInProgress: "En cours",
    statusDone: "Vu",
    progressFields: [
      { kind: "number", key: "heure", label: "Heure" },
      { kind: "number", key: "minute", label: "Minute" },
    ],
  },
  {
    name: "Anime",
    statusTodo: "À voir",
    statusInProgress: "En cours",
    statusDone: "Vu",
    progressFields: [
      { kind: "number", key: "saison", label: "Saison" },
      { kind: "number", key: "episode", label: "Épisode" },
    ],
  },
  {
    name: "Jeu Vidéo",
    statusTodo: "À faire",
    statusInProgress: "En cours",
    statusDone: "Fait",
    progressFields: [],
  },
];

export function parseProgressFields(json: string): ProgressField[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as ProgressField[]) : [];
  } catch {
    return [];
  }
}

// Valide/normalise une chaîne JSON de champs de progression (saisie utilisateur).
// Génère une clé stable à partir du libellé. Ignore les entrées invalides.
export function sanitizeProgressFields(raw: string): ProgressField[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw || "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const fields: ProgressField[] = [];
  for (const f of parsed) {
    if (!f || typeof f !== "object") continue;
    const obj = f as Record<string, unknown>;
    const label = String(obj.label ?? "").trim();
    const key = String(obj.key ?? label)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    if (!label || !key) continue;
    if (obj.kind === "unit-number") {
      const units = Array.isArray(obj.units)
        ? obj.units.map((u) => String(u).trim()).filter(Boolean)
        : [];
      if (units.length === 0) continue;
      fields.push({ kind: "unit-number", key, label, units });
    } else {
      fields.push({ kind: "number", key, label });
    }
  }
  return fields;
}

export function parseProgressValues(json: string | null | undefined): ProgressValues {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as ProgressValues) : {};
  } catch {
    return {};
  }
}

// Renvoie le libellé d'état (ex: "Lu", "En cours") pour une clé donnée.
export function statusLabel(
  type: { statusTodo: string; statusInProgress: string; statusDone: string },
  status: string,
): string {
  if (status === "todo") return type.statusTodo;
  if (status === "inProgress") return type.statusInProgress;
  return type.statusDone;
}

// Transforme les valeurs de progression en texte lisible.
// Ex: "Tome 5", "Saison 2, Épisode 4", "1h30".
export function formatProgress(fields: ProgressField[], values: ProgressValues): string {
  const parts: string[] = [];

  // Cas spécial joli pour les films (heure + minute).
  const isTime =
    fields.length === 2 &&
    fields.some((f) => f.key === "heure") &&
    fields.some((f) => f.key === "minute");
  if (isTime) {
    const h = Number((values.heure as number) ?? 0);
    const m = Number((values.minute as number) ?? 0);
    if (h || m) return `${h}h${String(m).padStart(2, "0")}`;
    return "";
  }

  for (const field of fields) {
    const value = values[field.key];
    if (value === undefined || value === null) continue;
    if (field.kind === "unit-number" && typeof value === "object") {
      parts.push(`${value.unit} ${value.value}`);
    } else if (field.kind === "number" && typeof value === "number") {
      parts.push(`${field.label} ${value}`);
    }
  }
  return parts.join(", ");
}
