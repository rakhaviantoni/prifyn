import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { isAuthConfigured, isGoogleAuthConfigured } from "@/lib/auth/server";

const requiredTables = ["users", "sessions", "accounts", "verifications", "user_profiles"];

export async function GET() {
  if (!isAuthConfigured() || !isGoogleAuthConfigured()) {
    return Response.json({ configured: false, reason: "credentials" }, { status: 503 });
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
    return Response.json({ configured: true });
  } catch {
    return Response.json({ configured: false, reason: "database" }, { status: 503 });
  }
}
