import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { businessOrganizations, member } from "@/db/schema";
import { getAuth, isAuthConfigured } from "@/lib/auth/server";

const connectionRoles = new Set(["owner", "admin"]);

export async function requireConnectionAdmin(request: Request, requestedOrganizationId?: string | null) {
  if (!isAuthConfigured()) throw new Response("Authentication is not configured.", { status: 503 });
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session?.user) throw new Response("Sign in is required.", { status: 401 });

  const db = getDb();
  const memberships = await db.select({ workspaceId: member.organizationId, role: member.role }).from(member).where(eq(member.userId, session.user.id));
  const membership = memberships.find(item => connectionRoles.has(item.role));
  if (!membership) throw new Response("Workspace owner or admin access is required.", { status: 403 });

  const organizations = requestedOrganizationId
    ? await db.select().from(businessOrganizations).where(and(eq(businessOrganizations.workspaceId, membership.workspaceId), eq(businessOrganizations.id, requestedOrganizationId))).limit(1)
    : await db.select().from(businessOrganizations).where(eq(businessOrganizations.workspaceId, membership.workspaceId)).limit(1);
  const organization = organizations[0];
  if (!organization) throw new Response("Create an operating brand before connecting a channel.", { status: 409 });
  return { userId: session.user.id, workspaceId: membership.workspaceId, organization };
}
