import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { businessOrganizations, member, organization, organizationMembers } from "@/db/schema";
import { getAuth, isAuthConfigured } from "@/lib/auth/server";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "workspace";
}

export async function getWorkspaceContextFromRequest(request: Request) {
  if (!isAuthConfigured()) throw new Response("Authentication is not configured.", { status: 503 });
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session?.user) throw new Response("Sign in is required.", { status: 401 });

  const db = getDb();
  let memberships = await db.select().from(member).where(eq(member.userId, session.user.id)).limit(1);
  let membership = memberships[0];

  if (!membership) {
    const workspaceId = `ws_${randomUUID()}`;
    const workspaceName = `${session.user.name || session.user.email?.split("@")[0] || "My"} Workspace`;
    await db.insert(organization).values({
      id: workspaceId,
      name: workspaceName,
      slug: `${slugify(workspaceName)}-${workspaceId.slice(3, 9)}`,
    });
    const memberId = `mem_${randomUUID()}`;
    await db.insert(member).values({
      id: memberId,
      organizationId: workspaceId,
      userId: session.user.id,
      role: "owner",
    });
    memberships = await db.select().from(member).where(eq(member.id, memberId)).limit(1);
    membership = memberships[0];
  }

  const organizations = await db.select().from(businessOrganizations).where(eq(businessOrganizations.workspaceId, membership.organizationId)).limit(1);
  let brand = organizations[0];
  if (!brand) {
    const [createdBrand] = await db.insert(businessOrganizations).values({
      workspaceId: membership.organizationId,
      name: "Operating brand",
      slug: "operating-brand",
      type: "brand",
    }).returning();
    brand = createdBrand;
    await db.insert(organizationMembers).values({
      organizationId: brand.id,
      workspaceMemberId: membership.id,
      role: "owner",
    }).onConflictDoNothing();
  }

  return { db, session, membership, brand };
}
