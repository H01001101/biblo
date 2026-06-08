import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "biblo_session";
const SECRET = new TextEncoder().encode(
  process.env.BIBLO_SECRET ?? "biblo-dev-secret-change-me-in-production",
);
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

// Crée une session : signe un jeton avec l'id utilisateur et le pose en cookie.
export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

// Lit l'id utilisateur depuis le cookie (ou null si non connecté / jeton invalide).
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return (payload.userId as string) ?? null;
  } catch {
    return null;
  }
}

// Supprime le cookie de session (déconnexion).
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
