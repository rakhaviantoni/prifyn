import { headers } from "next/headers";
import { desc, eq, inArray } from "drizzle-orm";
import { activities, companies, contacts, leads } from "@/db/schema";
import { isAuthConfigured } from "@/lib/auth/server";
import { getWorkspaceContextFromHeaders } from "@/lib/workspace-context";

export type LeadInboxItem = {
  id: string;
  status: string;
  source: string;
  company: string;
  contact: string;
  email: string;
  role: string;
  createdAt: string;
  channel?: string;
  urgency?: string;
  spend?: string;
  preferredTime?: string;
  problem?: string;
};

export async function getLeadInbox(): Promise<LeadInboxItem[]> {
  if (!isAuthConfigured()) return [];
  const { db, brand } = await getWorkspaceContextFromHeaders(await headers());
  const rows = await db.select({
    id: leads.id,
    status: leads.status,
    source: leads.source,
    createdAt: leads.createdAt,
    company: companies.name,
    contact: contacts.name,
    email: contacts.email,
    role: contacts.title,
  }).from(leads)
    .leftJoin(companies, eq(companies.id, leads.companyId))
    .leftJoin(contacts, eq(contacts.id, leads.contactId))
    .where(eq(leads.organizationId, brand.id))
    .orderBy(desc(leads.createdAt))
    .limit(80);

  const ids = rows.map(row => row.id);
  const activityRows = ids.length ? await db.select().from(activities).where(inArray(activities.subjectId, ids)).orderBy(desc(activities.occurredAt)) : [];
  const activityByLead = new Map(activityRows.map(row => [row.subjectId, row.metadata ?? {}]));

  return rows.map(row => {
    const metadata = activityByLead.get(row.id) as Record<string, unknown> | undefined;
    return {
      id: row.id,
      status: row.status,
      source: row.source ?? "manual",
      company: row.company ?? "Unknown company",
      contact: row.contact ?? "Unknown contact",
      email: row.email ?? "No email",
      role: row.role ?? "",
      createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
      channel: typeof metadata?.channel === "string" ? metadata.channel : undefined,
      urgency: typeof metadata?.urgency === "string" ? metadata.urgency : undefined,
      spend: typeof metadata?.spend === "string" ? metadata.spend : undefined,
      preferredTime: typeof metadata?.preferredTime === "string" ? metadata.preferredTime : undefined,
      problem: typeof metadata?.problem === "string" ? metadata.problem : undefined,
    };
  });
}
