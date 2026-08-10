import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { brandAccountBindings, integrationAuditEvents, providerAccounts, providerAuthorizations } from "@/db/schema";
import { requireConnectionAdmin } from "@/lib/integrations/access";

export async function POST(request: Request, context: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await context.params;
  const input = await request.json().catch(() => ({})) as { organizationId?: string; reportingEnabled?: boolean; publishingEnabled?: boolean };
  try {
    const access = await requireConnectionAdmin(request, input.organizationId);
    const db = getDb();
    const accounts = await db.select({ id: providerAccounts.id, provider: providerAccounts.provider }).from(providerAccounts)
      .innerJoin(providerAuthorizations, eq(providerAccounts.authorizationId, providerAuthorizations.id))
      .where(and(eq(providerAccounts.id, accountId), eq(providerAuthorizations.workspaceId, access.workspaceId))).limit(1);
    const account = accounts[0];
    if (!account) return Response.json({ error: "ACCOUNT_NOT_FOUND" }, { status: 404 });
    const rows = await db.insert(brandAccountBindings).values({
      workspaceId: access.workspaceId,
      organizationId: access.organization.id,
      providerAccountId: account.id,
      reportingEnabled: input.reportingEnabled ?? true,
      publishingEnabled: input.publishingEnabled ?? false,
    }).onConflictDoUpdate({
      target: [brandAccountBindings.organizationId, brandAccountBindings.providerAccountId],
      set: { reportingEnabled: input.reportingEnabled ?? true, publishingEnabled: input.publishingEnabled ?? false, updatedAt: new Date() },
    }).returning({ id: brandAccountBindings.id });
    await db.insert(integrationAuditEvents).values({
      workspaceId: access.workspaceId,
      organizationId: access.organization.id,
      providerAccountId: account.id,
      actorUserId: access.userId,
      action: "provider_account.assigned",
      metadata: { provider: account.provider, reportingEnabled: input.reportingEnabled ?? true, publishingEnabled: input.publishingEnabled ?? false },
    });
    return Response.json({ bindingId: rows[0].id, assigned: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "ASSIGNMENT_FAILED" }, { status: 500 });
  }
}
