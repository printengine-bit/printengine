import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";

export type AuthTokenPurpose = "verify_email" | "reset_password";

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function issueAuthToken(userId: string, purpose: AuthTokenPurpose, lifetimeSeconds: number) {
  const token = randomBytes(32).toString("base64url");
  await db().begin(async (sql) => {
    await sql`DELETE FROM auth_tokens WHERE user_id=${userId} AND purpose=${purpose} AND used_at IS NULL`;
    await sql`INSERT INTO auth_tokens (user_id,purpose,token_hash,expires_at) VALUES (${userId},${purpose},${tokenHash(token)},now() + (${lifetimeSeconds} * interval '1 second'))`;
  });
  return token;
}

export async function consumeAuthToken(token: string, purpose: AuthTokenPurpose) {
  if (!token || token.length > 200) return null;
  return db().begin(async (sql) => {
    const rows = await sql<Array<{ id: string; user_id: string }>>`
      SELECT id,user_id FROM auth_tokens
      WHERE token_hash=${tokenHash(token)} AND purpose=${purpose} AND used_at IS NULL AND expires_at>now()
      LIMIT 1 FOR UPDATE
    `;
    if (!rows[0]) return null;
    await sql`UPDATE auth_tokens SET used_at=now() WHERE id=${rows[0].id}`;
    return rows[0].user_id;
  });
}
