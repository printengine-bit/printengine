import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required.");

const sql = postgres(url, { max: 1 });
await sql`CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
const directory = path.join(process.cwd(), "database");
const files = (await readdir(directory)).filter((name) => /^\d+.*\.sql$/.test(name)).sort();
for (const name of files) {
  const applied = await sql<Array<{ name: string }>>`SELECT name FROM schema_migrations WHERE name=${name}`;
  if (applied.length) continue;
  const migration = await readFile(path.join(directory, name), "utf8");
  await sql.begin(async (transaction) => {
    await transaction.unsafe(migration);
    await transaction`INSERT INTO schema_migrations (name) VALUES (${name})`;
  });
  console.log(`Applied ${name}`);
}
await sql.end();
console.log("Custom commerce database is current.");
