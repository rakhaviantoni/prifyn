import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (database) return database;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required before database-backed features can run.");
  const client = postgres(url, { max: 5, prepare: false, idle_timeout: 20 });
  database = drizzle(client, { schema });
  return database;
}
