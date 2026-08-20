import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

type WorkerEnv = {
  HYPERDRIVE?: { connectionString?: string };
};

function getWorkerEnv() {
  return (globalThis as typeof globalThis & { __PRIFYN_WORKER_ENV__?: WorkerEnv }).__PRIFYN_WORKER_ENV__;
}

export function getDatabaseConnectionSource() {
  const hyperdrive = getWorkerEnv()?.HYPERDRIVE?.connectionString;
  if (hyperdrive) return { url: hyperdrive, source: "hyperdrive" as const };
  const url = process.env.DATABASE_URL;
  if (url) return { url, source: "database_url" as const };
  return { url: "", source: "missing" as const };
}

export function getDb() {
  if (database) return database;
  const { url, source } = getDatabaseConnectionSource();
  if (!url) throw new Error("DATABASE_URL or HYPERDRIVE binding is required before database-backed features can run.");
  const client = postgres(url, {
    max: source === "hyperdrive" ? 10 : 5,
    prepare: false,
    idle_timeout: 20,
  });
  database = drizzle(client, { schema });
  return database;
}
