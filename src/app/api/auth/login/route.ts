import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, passwordMatches, type SessionUser } from "@/lib/auth";
import { db, databaseConfigured } from "@/lib/db";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function POST(request: Request) {
  if (!databaseConfigured()) {
    return NextResponse.json({ error: "Connect the commerce database before signing in." }, { status: 503 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  const rows = await db()<Array<SessionUser & { password_hash: string; active: boolean }>>`
    SELECT id, email, name, role, password_hash, active FROM users
    WHERE email = ${parsed.data.email.toLowerCase()} LIMIT 1
  `;
  const user = rows[0];
  if (!user?.active || !(await passwordMatches(parsed.data.password, user.password_hash))) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }
  await createSession(user);
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
