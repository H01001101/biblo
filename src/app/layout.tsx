import type { Metadata } from "next";
import {
  Cinzel,
  EB_Garamond,
  Pixelify_Sans,
  Pirata_One,
} from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { getCurrentUser } from "@/lib/auth";
import { getTopContributors } from "@/lib/queries";

// Polices des interfaces thématiques (chargées par le navigateur uniquement
// quand le thème correspondant est actif).
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700"] });
const garamond = EB_Garamond({ subsets: ["latin"], variable: "--font-serif" });
const pixel = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixel" });
const pirate = Pirata_One({ subsets: ["latin"], variable: "--font-pirate", weight: "400" });

export const metadata: Metadata = {
  title: "Biblo",
  description:
    "Tes listes de films, séries, animes, livres, mangas, jeux vidéo et bien plus.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, topContributors] = await Promise.all([
    getCurrentUser(),
    getTopContributors(3),
  ]);
  // Une interface thématique (ex: "medieval") prend le dessus sur les réglages
  // classiques thème/style. Sinon, on applique theme (clair/sombre) + uiStyle.
  const themedInterface =
    user?.interfaceTheme && user.interfaceTheme !== "none"
      ? user.interfaceTheme
      : null;

  const isDark = user?.theme === "dark";
  const isModern = user?.uiStyle !== "classic";

  const htmlClass = [
    "h-full antialiased",
    // variables de polices (utilisées uniquement par les interfaces thématiques)
    cinzel.variable,
    garamond.variable,
    pixel.variable,
    pirate.variable,
    themedInterface
      ? `theme-${themedInterface}`
      : `${isDark ? "dark " : ""}${isModern ? "ui-modern" : "ui-classic"}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <html lang="fr" className={htmlClass}>
      <body className="flex min-h-full flex-col">
        <Nav user={user} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-[var(--color-line)] py-6 text-xs text-[var(--color-muted)]">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
            <div>
              <a
                href="/guide"
                className="font-medium text-[var(--color-accent)] hover:underline"
              >
                Guide d&apos;utilisation
              </a>
              <br />
              Biblo
              <br />
              Support - martin.hamelle@dauphine.eu
            </div>

            {topContributors.length > 0 && (
              <div className="sm:text-right">
                <p className="mb-1 font-semibold text-[var(--color-ink)]">
                  Top contributeurs
                </p>
                <ol className="space-y-0.5">
                  {topContributors.map((c, i) => (
                    <li key={c.username}>
                      <span className="font-medium text-[var(--color-ink)]">
                        {c.username}
                      </span>{" "}
                      - {c.count} élément{c.count > 1 ? "s" : ""}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </footer>
      </body>
    </html>
  );
}
