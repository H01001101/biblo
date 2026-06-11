"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { logout } from "@/app/actions/auth";
import type { CurrentUser } from "@/lib/auth";

function Tab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--color-accent)] text-white"
          : "text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Nav({ user }: { user: CurrentUser | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // Logo : on affiche le hibou SVG par défaut (jamais d'image cassée), puis on
  // bascule sur /logo.png s'il a été ajouté dans le dossier public/.
  const [logoSrc, setLogoSrc] = useState("/logo.svg");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const probe = new Image();
    probe.onload = () => setLogoSrc("/logo.png");
    probe.src = "/logo.png";
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-surface)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="Biblo"
            className="brand-badge h-9 w-9 rounded-full object-cover ring-1 ring-[var(--color-line)]"
          />
          <span className="brand-title text-lg font-semibold tracking-tight">
            Biblo
          </span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          <Tab href="/" label="Catalogue" active={isActive("/")} />
          <Tab
            href="/nouveautes"
            label="Nouveautés"
            active={isActive("/nouveautes")}
          />
          {user && !isAdmin && (
            <Tab
              href="/lists"
              label="Mes Listes"
              active={isActive("/lists")}
            />
          )}
          {isAdmin && (
            <Tab href="/admin" label="Admin" active={isActive("/admin")} />
          )}
          {user && (
            <Tab
              href="/profile"
              label="Profil"
              active={isActive("/profile")}
            />
          )}
          <Tab href="/guide" label="Aide" active={isActive("/guide")} />
        </nav>

        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="btn-secondary"
            >
              <span className="max-w-[8rem] truncate">{user.username}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] shadow-lg">
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-[var(--color-surface-2)]"
                >
                  Mon profil
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Se déconnecter
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="btn-primary">
            Se connecter
          </Link>
        )}
      </div>
    </header>
  );
}
