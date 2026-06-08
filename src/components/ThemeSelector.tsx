"use client";

import { setTheme, setUiStyle } from "@/app/actions/profile";

export default function ThemeSelector({
  theme,
  uiStyle,
}: {
  theme: string;
  uiStyle: string;
}) {
  return (
    <div className="card space-y-5 p-4">
      <div>
        <h2 className="font-medium">Apparence</h2>
      </div>

      <div>
        <p className="label">Thème</p>
        <div className="flex gap-2">
          <form action={setTheme}>
            <input type="hidden" name="theme" value="light" />
            <button
              type="submit"
              className={theme === "light" ? "btn-primary" : "btn-secondary"}
            >
              Clair
            </button>
          </form>
          <form action={setTheme}>
            <input type="hidden" name="theme" value="dark" />
            <button
              type="submit"
              className={theme === "dark" ? "btn-primary" : "btn-secondary"}
            >
              Sombre
            </button>
          </form>
        </div>
      </div>

      <div>
        <p className="label">Style d&apos;interface</p>
        <div className="flex flex-wrap gap-2">
          <form action={setUiStyle}>
            <input type="hidden" name="uiStyle" value="modern" />
            <button
              type="submit"
              className={uiStyle !== "classic" ? "btn-primary" : "btn-secondary"}
            >
              Moderne
            </button>
          </form>
          <form action={setUiStyle}>
            <input type="hidden" name="uiStyle" value="classic" />
            <button
              type="submit"
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
