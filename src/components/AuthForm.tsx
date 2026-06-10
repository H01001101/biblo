"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, type AuthState } from "@/app/actions/auth";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "login" ? login : register;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {},
  );

  const isLogin = mode === "login";

  return (
    <div className="mx-auto max-w-sm">
      <div className="card p-6">
        <h1 className="mb-1 text-xl font-semibold">
          {isLogin ? "Se connecter" : "Créer un compte"}
        </h1>
        <p className="mb-5 text-sm text-[var(--color-muted)]">
          {isLogin
            ? "Connecte-toi pour gérer tes listes."
            : "Choisissez un nom d'utilisateur et un mot de passe."}
        </p>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="username">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              name="username"
              className="input"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
            />
          </div>
          {!isLogin && (
            <div>
              <label className="label" htmlFor="confirm">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                className="input"
                autoComplete="new-password"
                required
              />
            </div>
          )}

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={pending}>
            {pending
              ? "Veuillez patienter…"
              : isLogin
                ? "Se connecter"
                : "Créer mon compte"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
        {isLogin ? (
          <>
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-medium text-[var(--color-accent)]">
              Créer un compte
            </Link>
          </>
        ) : (
          <>
            Déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-[var(--color-accent)]">
              Se connecter
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
