import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { businessOrganizations, companies, member, organization, organizationMembers } from "@/db/schema";
import { getAuth, isAuthConfigured } from "@/lib/auth/server";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "workspace";
}

export function getCookieValue(headers: Headers, key: string) {
  const cookie = headers.get("cookie") ?? "";
  return cookie.split(";").map(part => part.trim()).find(part => part.startsWith(`${key}=`))?.slice(key.length + 1);
}

export function brandInitials(value?: string | null) {
  const clean = (value ?? "").trim();
  if (!clean) return "BR";
  return clean.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

export function brandDetail(row: typeof businessOrganizations.$inferSelect) {
  if (row.name === "Operating brand") return "Set up brand profile";
  return row.type === "brand" ? "Operating brand" : row.type.replace(/[-_]/g, " ");
}

async function ensureWorkspaceAndMembership(headers: Headers) {
  if (!isAuthConfigured()) throw new Response("Authentication is not configured.", { status: 503 });
  const session = await getAuth().api.getSession({ headers });
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
  return { db, session, membership };
}

export async function getWorkspaceBrandsFromHeaders(headers: Headers) {
  const { db, session, membership } = await ensureWorkspaceAndMembership(headers);
  let organizations = await db.select().from(businessOrganizations).where(eq(businessOrganizations.workspaceId, membership.organizationId));
  if (!organizations.length) {
    const [createdBrand] = await db.insert(businessOrganizations).values({
      workspaceId: membership.organizationId,
      name: "Operating brand",
      slug: "operating-brand",
      type: "brand",
    }).returning();
    await db.insert(organizationMembers).values({
      organizationId: createdBrand.id,
      workspaceMemberId: membership.id,
      role: "owner",
    }).onConflictDoNothing();
    organizations = [createdBrand];
  }
  return { db, session, membership, brands: organizations };
}

export async function getWorkspaceContextFromHeaders(headers: Headers) {
  const { db, session, membership, brands } = await getWorkspaceBrandsFromHeaders(headers);
  const requestedBrandId = getCookieValue(headers, "prifyn-active-brand-id");
  let brand = requestedBrandId ? brands.find(item => item.id === requestedBrandId) : undefined;
  brand ??= brands[0];
  return { db, session, membership, brand, brands };
}

export async function getWorkspaceContextFromRequest(request: Request) {
  return getWorkspaceContextFromHeaders(request.headers);
}

export async function upsertWorkspaceBrand(headers: Headers, payload: { id?: string | null; name: string; type?: string | null; logoUrl?: string | null }) {
  const { db, membership, session, brands } = await getWorkspaceBrandsFromHeaders(headers);
  const name = payload.name.trim();
  const type = payload.type?.trim() || "brand";
  const logoUrl = payload.logoUrl?.trim() || null;
  if (!name) throw new Response("Brand name is required.", { status: 400 });
  const slug = slugify(name);
  const existingById = payload.id ? brands.find(item => item.id === payload.id) : undefined;
  if (existingById) {
    const [updated] = await db.update(businessOrganizations).set({ name, slug, type, logoUrl, updatedAt: new Date() }).where(and(eq(businessOrganizations.workspaceId, membership.organizationId), eq(businessOrganizations.id, existingById.id))).returning();
    return { db, session, membership, brand: updated };
  }
  const duplicate = brands.find(item => item.slug === slug);
  if (duplicate) {
    const [updated] = await db.update(businessOrganizations).set({ name, type, logoUrl, updatedAt: new Date() }).where(and(eq(businessOrganizations.workspaceId, membership.organizationId), eq(businessOrganizations.id, duplicate.id))).returning();
    return { db, session, membership, brand: updated };
  }
  const [created] = await db.insert(businessOrganizations).values({
    workspaceId: membership.organizationId,
    name,
    slug,
    type,
    logoUrl,
  }).returning();
  await db.insert(organizationMembers).values({
    organizationId: created.id,
    workspaceMemberId: membership.id,
    role: "owner",
  }).onConflictDoNothing();
  return { db, session, membership, brand: created };
}

export async function ensureWorkspaceBrandCompany(input: {
  workspaceId: string;
  organizationId: string;
  name: string;
  ownerUserId?: string | null;
}) {
  const db = getDb();
  const [existing] = await db.select().from(companies).where(and(
    eq(companies.workspaceId, input.workspaceId),
    eq(companies.organizationId, input.organizationId),
    eq(companies.name, input.name),
  )).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(companies).values({
    workspaceId: input.workspaceId,
    organizationId: input.organizationId,
    name: input.name,
    lifecycleStage: "customer",
    ownerUserId: input.ownerUserId ?? null,
  }).returning();
  return created;
}

export async function getWorkspaceContextFromRequestLegacy(request: Request) {
  const { db, session, membership } = await ensureWorkspaceAndMembership(request.headers);
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
