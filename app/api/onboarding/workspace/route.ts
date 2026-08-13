import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { businessOrganizations, companies, organization, userProfiles } from "@/db/schema";
import { getOrCreateAccountProfile, type AccountType } from "@/lib/auth/account-profile";
import { getWorkspaceContextFromRequest } from "@/lib/workspace-context";

const Payload = z.object({
  accountType: z.enum(["brand", "agency", "creator"]),
  workspaceName: z.string().trim().min(2).max(160),
  displayName: z.string().trim().max(160).optional().nullable(),
});

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "workspace";
}

function brandType(accountType: AccountType) {
  if (accountType === "agency") return "agency-client";
  if (accountType === "creator") return "creator-brand";
  return "brand";
}

export async function POST(request: Request) {
  try {
    const payload = Payload.parse(await request.json());
    const { db, session, membership, brand } = await getWorkspaceContextFromRequest(request);
    const workspaceName = payload.workspaceName;
    const type = brandType(payload.accountType);

    await db.update(organization).set({
      name: workspaceName,
      slug: `${slugify(workspaceName)}-${membership.organizationId.slice(-6).toLowerCase()}`,
    }).where(eq(organization.id, membership.organizationId));

    const [updatedBrand] = await db.update(businessOrganizations).set({
      name: workspaceName,
      slug: slugify(workspaceName),
      type,
      updatedAt: new Date(),
    }).where(and(
      eq(businessOrganizations.workspaceId, membership.organizationId),
      eq(businessOrganizations.id, brand.id),
    )).returning();
    const savedBrand = updatedBrand ?? brand;

    const profile = await getOrCreateAccountProfile(session.user.id, payload.accountType, payload.displayName || workspaceName);
    await db.update(userProfiles).set({
      accountType: payload.accountType,
      displayName: payload.displayName || workspaceName,
      onboardingStatus: "completed",
      updatedAt: new Date(),
    }).where(eq(userProfiles.userId, profile.userId));

    let companyId: string | null = null;
    if (payload.accountType !== "creator") {
      const [existingCompany] = await db.select().from(companies).where(and(
        eq(companies.workspaceId, membership.organizationId),
        eq(companies.organizationId, savedBrand.id),
        eq(companies.name, workspaceName),
      )).limit(1);
      const company = existingCompany ?? (await db.insert(companies).values({
        workspaceId: membership.organizationId,
        organizationId: savedBrand.id,
        name: workspaceName,
        lifecycleStage: "customer",
        ownerUserId: session.user.id,
      }).returning())[0];
      companyId = company.id;
    }

    return Response.json({
      ok: true,
      workspace: { id: membership.organizationId, name: workspaceName },
      brand: { id: savedBrand.id, name: workspaceName, type },
      companyId,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof z.ZodError) return Response.json({ ok: false, error: "Workspace setup data is incomplete.", issues: error.issues }, { status: 400 });
    return Response.json({ ok: false, error: "Workspace setup could not be completed." }, { status: 503 });
  }
}
