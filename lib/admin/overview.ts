import { desc, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  activities,
  businessOrganizations,
  companies,
  contacts,
  importJobs,
  leads,
  organization,
  user,
  webhookEndpoints,
} from "@/db/schema";

export async function getAdminOverview() {
  const db = getDb();
  const [[usersRow], [workspacesRow], [brandsRow], [leadsRow], [importsRow], [webhooksRow]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(user),
    db.select({ count: sql<number>`count(*)::int` }).from(organization),
    db.select({ count: sql<number>`count(*)::int` }).from(businessOrganizations),
    db.select({ count: sql<number>`count(*)::int` }).from(leads),
    db.select({ count: sql<number>`count(*)::int` }).from(importJobs),
    db.select({ count: sql<number>`count(*)::int` }).from(webhookEndpoints),
  ]);

  const leadRows = await db.select({
    id: leads.id,
    status: leads.status,
    source: leads.source,
    createdAt: leads.createdAt,
    company: companies.name,
    contact: contacts.name,
    email: contacts.email,
    brand: businessOrganizations.name,
    workspace: organization.name,
  }).from(leads)
    .leftJoin(companies, sql`${companies.id} = ${leads.companyId}`)
    .leftJoin(contacts, sql`${contacts.id} = ${leads.contactId}`)
    .leftJoin(businessOrganizations, sql`${businessOrganizations.id} = ${leads.organizationId}`)
    .leftJoin(organization, sql`${organization.id} = ${leads.workspaceId}`)
    .orderBy(desc(leads.createdAt))
    .limit(80);

  const ids = leadRows.map(row => row.id);
  const activityRows = ids.length ? await db.select().from(activities).where(inArray(activities.subjectId, ids)).orderBy(desc(activities.occurredAt)) : [];
  const activitiesByLead = new Map<string, typeof activityRows>();
  for (const row of activityRows) {
    const current = activitiesByLead.get(row.subjectId) ?? [];
    current.push(row);
    activitiesByLead.set(row.subjectId, current);
  }

  const recentImports = await db.select({
    id: importJobs.id,
    sourceType: importJobs.sourceType,
    status: importJobs.status,
    acceptedRows: importJobs.acceptedRows,
    totalRows: importJobs.totalRows,
    createdAt: importJobs.createdAt,
    brand: businessOrganizations.name,
  }).from(importJobs)
    .leftJoin(businessOrganizations, sql`${businessOrganizations.id} = ${importJobs.organizationId}`)
    .orderBy(desc(importJobs.createdAt))
    .limit(8);

  return {
    metrics: {
      users: usersRow?.count ?? 0,
      workspaces: workspacesRow?.count ?? 0,
      operatingBrands: brandsRow?.count ?? 0,
      leads: leadsRow?.count ?? 0,
      imports: importsRow?.count ?? 0,
      webhooks: webhooksRow?.count ?? 0,
    },
    leads: leadRows.map(row => {
      const leadActivities = activitiesByLead.get(row.id) ?? [];
      const intake = leadActivities.find(activity => activity.type === "appointment" || activity.type === "application")?.metadata as Record<string, unknown> | undefined;
      const booking = leadActivities.find(activity => activity.type === "appointment_booking_requested")?.metadata as Record<string, unknown> | undefined;
      const meeting = leadActivities.find(activity => activity.type === "meeting_outcome")?.metadata as Record<string, unknown> | undefined;
      return {
        id: row.id,
        status: row.status || "intake_received",
        source: row.source || "manual",
        company: row.company || "Unknown company",
        contact: row.contact || "Unknown contact",
        email: row.email || "No email",
        brand: row.brand || "No brand",
        workspace: row.workspace || "No workspace",
        createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
        channel: typeof intake?.channel === "string" ? intake.channel : "",
        urgency: typeof intake?.urgency === "string" ? intake.urgency : "",
        spend: typeof intake?.spend === "string" ? intake.spend : "",
        problem: typeof intake?.problem === "string" ? intake.problem : "",
        preferredTime: typeof intake?.preferredTime === "string" ? intake.preferredTime : "",
        meetingDate: typeof booking?.requestedDate === "string" ? booking.requestedDate : "",
        meetingTime: typeof booking?.startTime === "string" && typeof booking?.endTime === "string" ? `${booking.startTime}–${booking.endTime}` : "",
        meetingOwnerName: typeof meeting?.ownerName === "string" ? meeting.ownerName : typeof booking?.ownerName === "string" ? booking.ownerName : "",
        meetingOwnerEmail: typeof meeting?.ownerEmail === "string" ? meeting.ownerEmail : typeof booking?.ownerEmail === "string" ? booking.ownerEmail : "",
        meetingStatus: typeof meeting?.meetingStatus === "string" ? meeting.meetingStatus : "",
        meetingOutcome: typeof meeting?.outcome === "string" ? meeting.outcome : "",
        meetingNextStep: typeof meeting?.nextStep === "string" ? meeting.nextStep : "",
      };
    }),
    imports: recentImports.map(row => ({
      id: row.id,
      sourceType: row.sourceType,
      status: row.status,
      acceptedRows: row.acceptedRows,
      totalRows: row.totalRows,
      brand: row.brand || "No brand",
      createdAt: row.createdAt.toISOString(),
    })),
  };
}
