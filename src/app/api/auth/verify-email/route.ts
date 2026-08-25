import { NextResponse } from "next/server";
import { consumeAuthToken } from "@/lib/auth-tokens";
import { db, databaseConfigured } from "@/lib/db";

export async function GET(request: Request) {
  if (!databaseConfigured()) return NextResponse.redirect(new URL("/account?verification=unavailable", request.url));
  const token = new URL(request.url).searchParams.get("token") || "";
  const userId = await consumeAuthToken(token, "verify_email");
  if (!userId) return NextResponse.redirect(new URL("/account?verification=invalid", request.url));
  await db()`UPDATE users SET email_verified_at=coalesce(email_verified_at,now()),updated_at=now() WHERE id=${userId}`;
  return NextResponse.redirect(new URL("/account?verification=success", request.url));
}
