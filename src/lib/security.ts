import { createHash } from "node:crypto";
import { db, databaseConfigured } from "@/lib/db";

export function requestIsSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function requestKey(request: Request, scope: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  const salt = process.env.RATE_LIMIT_SALT || process.env.SESSION_SECRET || "printengine-rate-limit";
  return `${scope}:${createHash("sha256").update(`${salt}:${address}`).digest("hex")}`;
}

export async function rateLimit(request: Request, scope: string, limit: number, windowSeconds: number) {
  if (!databaseConfigured()) return { allowed: false, retryAfter: windowSeconds };
  const key = requestKey(request, scope);
  const rows = await db()<Array<{ count: number; reset_at: Date }>>`
    INSERT INTO rate_limit_buckets (key, count, reset_at)
    VALUES (${key}, 1, now() + (${windowSeconds} * interval '1 second'))
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limit_buckets.reset_at <= now() THEN 1 ELSE rate_limit_buckets.count + 1 END,
      reset_at = CASE WHEN rate_limit_buckets.reset_at <= now() THEN now() + (${windowSeconds} * interval '1 second') ELSE rate_limit_buckets.reset_at END,
      updated_at = now()
    RETURNING count, reset_at
  `;
  const retryAfter = Math.max(1, Math.ceil((new Date(rows[0].reset_at).getTime() - Date.now()) / 1000));
  return { allowed: rows[0].count <= limit, retryAfter };
}

export function tooManyRequests(retryAfter: number) {
  return Response.json(
    { error: "Too many attempts. Please wait before trying again." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
