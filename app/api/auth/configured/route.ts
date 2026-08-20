import { sql } from "drizzle-orm";
import { getDatabaseConnectionSource, getDb } from "@/db";
import { isAuthConfigured, isGoogleAuthConfigured } from "@/lib/auth/server";

const requiredTables = ["users", "sessions", "accounts", "verifications", "user_profiles"];

export async function GET() {
  const database = getDatabaseConnectionSource();
  if (!isAuthConfigured()) {
    return Response.json({ configured: false, reason: "auth", database: database.source }, { status: 503 });
  }

  if (!isGoogleAuthConfigured()) {
    return Response.json({ configured: false, reason: "google" }, { status: 503 });
  }

  try {
    const result = await getDb().execute(sql<{ table_name: string }>`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name in ('users', 'sessions', 'accounts', 'verifications', 'user_profiles')
    `);
    const rows = Array.isArray(result) ? result : [];
    const found = new Set(rows.map(row => row.table_name));
    const missing = requiredTables.filter(table => !found.has(table));
    if (missing.length > 0) {
      return Response.json({ configured: false, reason: "migrations", missing }, { status: 503 });
    }
    return Response.json({ configured: true, database: database.source });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database query failed";
    return Response.json({
      configured: false,
      reason: "database",
      database: database.source,
      hint: database.source === "database_url" ? "If this runs on Cloudflare Workers, add a Hyperdrive binding named HYPERDRIVE or deploy on a Node runtime." : "Check the Hyperdrive binding and Supabase credentials.",
      detail: process.env.NODE_ENV === "development" ? message : undefined,
    }, { status: 503 });
  }
}
