import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required.");

const sql = postgres(url, { max: 1 });
const migration = await readFile(path.join(process.cwd(), "database", "001_initial.sql"), "utf8");
await sql.unsafe(migration);
await sql.end();
console.log("Custom commerce database migrated.");
