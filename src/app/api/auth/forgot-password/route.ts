import { NextResponse } from "next/server";
import { z } from "zod";
import { issueAuthToken } from "@/lib/auth-tokens";
import { db, databaseConfigured } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, requestIsSameOrigin, tooManyRequests } from "@/lib/security";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  if (!databaseConfigured()) return NextResponse.json({ error: "Customer accounts are not configured." }, { status: 503 });
  if (!requestIsSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const limited = await rateLimit(request, "auth-forgot", 4, 60 * 60);
  if (!limited.allowed) return tooManyRequests(limited.retryAfter);
  const parsed = schema.safeParse(await request.json());
  if (parsed.success) {
    const users = await db()<Array<{ id: string; email: string; name: string }>>`
      SELECT id,email,name FROM users WHERE email=${parsed.data.email.toLowerCase()} AND active=true LIMIT 1
    `;
    if (users[0]) {
      try {
        const token = await issueAuthToken(users[0].id, "reset_password", 60 * 60);
        await sendPasswordResetEmail(users[0].email, users[0].name, token);
      } catch (error) {
        console.error("Password reset email could not be sent", error);
      }
    }
  }
  return NextResponse.json({ ok: true });
}
