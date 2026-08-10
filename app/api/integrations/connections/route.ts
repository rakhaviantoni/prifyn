import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { brandAccountBindings, member, providerAccounts, providerAuthorizations } from "@/db/schema";
import { getAuth, isAuthConfigured } from "@/lib/auth/server";

export async function GET(request: Request) {
  if (!isAuthConfigured()) return Response.json({ connections: [], reason: "auth_not_configured" }, { status: 503 });
  try {
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session?.user) return Response.json({ connections: [] }, { status: 401 });
    const db = getDb();
    const memberships = await db.select({ workspaceId: member.organizationId }).from(member).where(eq(member.userId, session.user.id)).limit(1);
    if (!memberships[0]) return Response.json({ connections: [] }, { status: 403 });
    const authorizations = await db.select({
      id: providerAuthorizations.id,
      provider: providerAuthorizations.provider,
      status: providerAuthorizations.status,
      grantedScopes: providerAuthorizations.grantedScopes,
      tokenExpiresAt: providerAuthorizations.tokenExpiresAt,
      lastRefreshedAt: providerAuthorizations.lastRefreshedAt,
      lastErrorCode: providerAuthorizations.lastErrorCode,
    }).from(providerAuthorizations).where(eq(providerAuthorizations.workspaceId, memberships[0].workspaceId));
    const connections = [];
    for (const authorization of authorizations) {
      const accounts = await db.select({
        id: providerAccounts.id,
        externalAccountId: providerAccounts.externalAccountId,
        displayName: providerAccounts.displayName,
        accountType: providerAccounts.accountType,
        currency: providerAccounts.currency,
        timezone: providerAccounts.timezone,
        status: providerAccounts.status,
        lastDiscoveredAt: providerAccounts.lastDiscoveredAt,
      }).from(providerAccounts).where(eq(providerAccounts.authorizationId, authorization.id));
      const accountIds = new Set(accounts.map(account => account.id));
      const workspaceBindings = await db.select({
        id: brandAccountBindings.id,
        organizationId: brandAccountBindings.organizationId,
        providerAccountId: brandAccountBindings.providerAccountId,
        reportingEnabled: brandAccountBindings.reportingEnabled,
        publishingEnabled: brandAccountBindings.publishingEnabled,
        selectedIdentityExternalId: brandAccountBindings.selectedIdentityExternalId,
      }).from(brandAccountBindings).where(eq(brandAccountBindings.workspaceId, memberships[0].workspaceId));
      connections.push({ ...authorization, accounts, bindings: workspaceBindings.filter(binding => accountIds.has(binding.providerAccountId)) });
    }
    return Response.json({ connections });
  } catch {
    return Response.json({ connections: [], reason: "database_unreachable" }, { status: 503 });
  }
}
