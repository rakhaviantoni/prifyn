import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { creatorProfiles, member, userProfiles } from "@/db/schema";

export type AccountType = "brand" | "agency" | "creator";
export type PortalType = "app" | "creator";

export function accountTypeForPortal(portal: PortalType): AccountType {
  return portal === "creator" ? "creator" : "brand";
}

export function isAllowedInPortal(accountType: AccountType, portal: PortalType) {
  if (portal === "creator") return accountType === "creator";
  return accountType === "brand" || accountType === "agency";
}

export function destinationForAccountType(accountType: AccountType) {
  return accountType === "creator" ? "/creator" : "/app";
}

export async function getOrCreateAccountProfile(userId: string, fallbackAccountType: AccountType, displayName?: string | null) {
  const db = getDb();
  const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  if (existing[0]) return existing[0];

  const existingCreator = await db.select({ userId: creatorProfiles.userId }).from(creatorProfiles).where(eq(creatorProfiles.userId, userId)).limit(1);
  const existingMembership = await db.select({ userId: member.userId }).from(member).where(eq(member.userId, userId)).limit(1);
  const accountType = existingCreator[0] ? "creator" : existingMembership[0] ? "brand" : fallbackAccountType;

  const [created] = await db.insert(userProfiles).values({
    userId,
    accountType,
    displayName: displayName ?? null,
  }).returning();
  return created;
}
