import postgres, { type Sql } from "postgres";

let client: Sql | null = null;

export class CommerceSetupError extends Error {
  constructor(message = "The commerce database is not configured.") {
    super(message);
    this.name = "CommerceSetupError";
  }
}

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function db() {
  if (!process.env.DATABASE_URL) throw new CommerceSetupError();
  if (!client) {
    client = postgres(process.env.DATABASE_URL, {
      max: process.env.NODE_ENV === "production" ? 10 : 3,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }
  return client;
}
