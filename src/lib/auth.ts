import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db, databaseConfigured } from "@/lib/db";

const COOKIE = "printengine_session";
const MAX_AGE = 60 * 60 * 24 * 14;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "customer" | "staff" | "admin";
};

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(value);
}

export const passwordHash = (password: string) => hash(password, 12);
export const passwordMatches = (password: string, passwordHashValue: string) =>
  compare(password, passwordHashValue);

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function sessionUser(): Promise<SessionUser | null> {
  if (!databaseConfigured() || !process.env.SESSION_SECRET) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, secret());
    const rows = await db()<SessionUser[]>`
      SELECT id, email, name, role FROM users
      WHERE id = ${verified.payload.sub!} AND active = true
      LIMIT 1
    `;
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await sessionUser();
  if (!user || !["admin", "staff"].includes(user.role)) return null;
  return user;
}
