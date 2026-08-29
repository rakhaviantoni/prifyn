import { sql } from "drizzle-orm";
import { getDatabaseConnectionSource, getDb } from "@/db";
import { isAuthConfigured, isGoogleAuthConfigured } from "@/lib/auth/server";

const requiredTables = ["users", "sessions", "accounts", "verifications", "user_profiles"];
const requiredColumns: Record<string, string[]> = {
  users: ["id", "name", "email", "email_verified", "image", "created_at", "updated_at"],
  sessions: ["id", "expires_at", "token", "created_at", "updated_at", "ip_address", "user_agent", "user_id"],
  accounts: ["id", "account_id", "provider_id", "user_id", "access_token", "refresh_token", "id_token", "access_token_expires_at", "refresh_token_expires_at", "scope", "password", "created_at", "updated_at"],
  verifications: ["id", "identifier", "value", "expires_at", "created_at", "updated_at"],
  user_profiles: ["user_id", "account_type", "display_name", "onboarding_status", "created_at", "updated_at"],
};

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

    const columnsResult = await getDb().execute(sql<{ table_name: string; column_name: string }>`
      select table_name, column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name in ('users', 'sessions', 'accounts', 'verifications', 'user_profiles')
    `);
    const columns = (Array.isArray(columnsResult) ? columnsResult : []) as Array<{ table_name: string; column_name: string }>;
    const columnsByTable = new Map<string, Set<string>>();
    for (const row of columns) {
      const tableColumns = columnsByTable.get(row.table_name) ?? new Set<string>();
      tableColumns.add(row.column_name);
      columnsByTable.set(row.table_name, tableColumns);
    }
    const missingColumns = Object.entries(requiredColumns)
      .flatMap(([table, tableColumns]) => tableColumns
        .filter(column => !columnsByTable.get(table)?.has(column))
        .map(column => `${table}.${column}`));
    if (missingColumns.length > 0) {
      return Response.json({ configured: false, reason: "migration_columns", missing: missingColumns }, { status: 503 });
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
