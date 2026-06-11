"use client";

import { setTheme, setUiStyle, setInterfaceTheme } from "@/app/actions/profile";

export default function ThemeSelector({
  theme,
  uiStyle,
  interfaceTheme,
}: {
  theme: string;
  uiStyle: string;
  interfaceTheme: string;
}) {
  const themed = Boolean(interfaceTheme) && interfaceTheme !== "none";

  return (
    <div className="card space-y-5 p-4">
      <div>
        <h2 className="font-medium">Apparence</h2>
      </div>

      {/* Interface thématique */}
      <div>
        <p className="label">Interface thématique</p>
        <div className="flex flex-wrap gap-2">
          <form action={setInterfaceTheme}>
            <input type="hidden" name="interfaceTheme" value="none" />
            <button
              type="submit"
              className={!themed ? "btn-primary" : "btn-secondary"}
            >
              Aucune (classique)
            </button>
          </form>
          <form action={setInterfaceTheme}>
            <input type="hidden" name="interfaceTheme" value="medieval" />
            <button
              type="submit"
              className={
                interfaceTheme === "medieval" ? "btn-primary" : "btn-secondary"
              }
            >
              Medieval Fantasy
            </button>
          </form>
        </div>
        {themed && (
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Une interface thématique est active : les réglages Thème et Style
            ci-dessous sont ignorés tant qu&apos;elle l&apos;est. Choisis
            « Aucune » pour les réutiliser.
          </p>
        )}
      </div>

      {/* Réglages classiques (désactivés si une interface thématique est active) */}
      <div className={themed ? "pointer-events-none opacity-40" : ""}>
        <p className="label">Thème</p>
        <div className="flex gap-2">
          <form action={setTheme}>
            <input type="hidden" name="theme" value="light" />
            <button
              type="submit"
              disabled={themed}
              className={theme === "light" ? "btn-primary" : "btn-secondary"}
            >
              Clair
            </button>
          </form>
          <form action={setTheme}>
            <input type="hidden" name="theme" value="dark" />
            <button
              type="submit"
              disabled={themed}
              className={theme === "dark" ? "btn-primary" : "btn-secondary"}
            >
              Sombre
            </button>
          </form>
        </div>

        <p className="label mt-4">Style d&apos;interface</p>
        <div className="flex flex-wrap gap-2">
          <form action={setUiStyle}>
            <input type="hidden" name="uiStyle" value="modern" />
            <button
              type="submit"
              disabled={themed}
              className={uiStyle !== "classic" ? "btn-primary" : "btn-secondary"}
            >
              Moderne
            </button>
          </form>
          <form action={setUiStyle}>
            <input type="hidden" name="uiStyle" value="classic" />
            <button
              type="submit"
              disabled={themed}
              className={uiStyle === "classic" ? "btn-primary" : "btn-secondary"}
            >
              Classique
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
