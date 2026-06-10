import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { getCurrentUser } from "@/lib/auth";
import { getTopContributors } from "@/lib/queries";

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
  const isDark = user?.theme === "dark";
  // Style moderne (iOS 26) par défaut ; "classic" rétablit l'ancienne UI.
  const isModern = user?.uiStyle !== "classic";
  const htmlClass = [
    "h-full antialiased",
    isDark ? "dark" : "",
    isModern ? "ui-modern" : "ui-classic",
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
