import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, passwordHash, type SessionUser } from "@/lib/auth";
import { db, databaseConfigured } from "@/lib/db";
import { issueAuthToken } from "@/lib/auth-tokens";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, requestIsSameOrigin, tooManyRequests } from "@/lib/security";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  phone: z.string().trim().min(8).max(20).optional(),
  password: z.string().min(8).max(100),
});

export async function POST(request: Request) {
  if (!databaseConfigured()) return NextResponse.json({ error: "Customer accounts are not configured." }, { status: 503 });
  if (!requestIsSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const limited = await rateLimit(request, "auth-register", 5, 60 * 60);
  if (!limited.allowed) return tooManyRequests(limited.retryAfter);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check your name, email, phone and password." }, { status: 400 });
  try {
    const rows = await db()<SessionUser[]>`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (
        ${parsed.data.name}, ${parsed.data.email.toLowerCase()}, ${parsed.data.phone ?? null},
        ${await passwordHash(parsed.data.password)}, 'customer'
      ) RETURNING id, email, name, role
    `;
    await createSession(rows[0]);
    try {
      const token = await issueAuthToken(rows[0].id, "verify_email", 24 * 60 * 60);
      await sendVerificationEmail(rows[0].email, rows[0].name, token);
    } catch (error) {
      console.error("Verification email could not be sent", error);
    }
    return NextResponse.json({ user: rows[0], verificationSent: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }
}
