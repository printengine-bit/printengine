import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeAuthToken } from "@/lib/auth-tokens";
import { passwordHash } from "@/lib/auth";
import { db, databaseConfigured } from "@/lib/db";
import { rateLimit, requestIsSameOrigin, tooManyRequests } from "@/lib/security";

const schema = z.object({ token: z.string().min(20).max(200), password: z.string().min(10).max(100) });

export async function POST(request: Request) {
  if (!databaseConfigured()) return NextResponse.json({ error: "Customer accounts are not configured." }, { status: 503 });
  if (!requestIsSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const limited = await rateLimit(request, "auth-reset", 6, 60 * 60);
  if (!limited.allowed) return tooManyRequests(limited.retryAfter);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Use a valid reset link and a password of at least 10 characters." }, { status: 400 });
  const userId = await consumeAuthToken(parsed.data.token, "reset_password");
  if (!userId) return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  await db()`UPDATE users SET password_hash=${await passwordHash(parsed.data.password)},updated_at=now() WHERE id=${userId}`;
  return NextResponse.json({ ok: true });
}
