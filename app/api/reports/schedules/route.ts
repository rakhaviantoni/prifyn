import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { outboxEvents, reportSchedules } from "@/db/schema";
import { nextReportSendAt, splitRecipients, type ReportCadence } from "@/lib/reports/schedules";
import { getWorkspaceContextFromRequest } from "@/lib/workspace-context";

const SchedulePayload = z.object({
  enabled: z.boolean(),
  name: z.string().trim().min(2).max(120).default("Growth report"),
  cadence: z.enum(["weekly", "monthly"]).default("weekly"),
  dayOfWeek: z.coerce.number().int().min(0).max(6).default(1),
  dayOfMonth: z.coerce.number().int().min(1).max(28).default(1),
  sendTime: z.string().trim().regex(/^([01]?\d|2[0-3]):([0-5]\d)$/).default("09:00"),
  timezone: z.string().trim().min(2).max(80).default("Asia/Jakarta"),
  recipients: z.union([z.string(), z.array(z.string())]).default(""),
  views: z.array(z.string()).default(["Executive"]),
  filters: z.record(z.string(), z.unknown()).default({}),
});

function normalizeRecipients(value: string | string[]) {
  const recipients = Array.isArray(value) ? value : splitRecipients(value);
  return Array.from(new Set(recipients.map(item => item.trim()).filter(item => z.string().email().safeParse(item).success)));
}

function toPublicSchedule(row: typeof reportSchedules.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    cadence: row.cadence,
    dayOfWeek: row.dayOfWeek,
    dayOfMonth: row.dayOfMonth,
    sendTime: row.sendTime,
    timezone: row.timezone,
    recipients: row.recipients,
    views: row.views,
    filters: row.filters,
    status: row.status,
    lastSentAt: row.lastSentAt?.toISOString() ?? null,
    nextSendAt: row.nextSendAt.toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const { db, membership, brand } = await getWorkspaceContextFromRequest(request);
    const rows = await db.select().from(reportSchedules).where(and(
      eq(reportSchedules.workspaceId, membership.organizationId),
      eq(reportSchedules.organizationId, brand.id),
    )).orderBy(desc(reportSchedules.updatedAt));
    return Response.json({ schedules: rows.map(toPublicSchedule) });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ schedules: [], error: "Report schedules could not be loaded." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = SchedulePayload.parse(await request.json());
    const { db, session, membership, brand } = await getWorkspaceContextFromRequest(request);
    const existing = await db.select().from(reportSchedules).where(and(
      eq(reportSchedules.workspaceId, membership.organizationId),
      eq(reportSchedules.organizationId, brand.id),
      eq(reportSchedules.name, payload.name),
    )).limit(1);
    const recipients = normalizeRecipients(payload.recipients);
    if (payload.enabled && !recipients.length) {
      return Response.json({ ok: false, error: "Add at least one valid recipient email." }, { status: 400 });
    }
    const nextSendAt = nextReportSendAt({
      cadence: payload.cadence as ReportCadence,
      dayOfWeek: payload.dayOfWeek,
      dayOfMonth: payload.dayOfMonth,
      sendTime: payload.sendTime,
    });
    const values = {
      workspaceId: membership.organizationId,
      organizationId: brand.id,
      createdByUserId: session.user.id,
      name: payload.name,
      cadence: payload.cadence,
      dayOfWeek: payload.dayOfWeek,
      dayOfMonth: payload.dayOfMonth,
      sendTime: payload.sendTime,
      timezone: payload.timezone,
      recipients,
      views: payload.views.length ? payload.views : ["Executive"],
      filters: payload.filters,
      status: payload.enabled ? "active" : "paused",
      nextSendAt,
      updatedAt: new Date(),
    };
    const [schedule] = existing[0]
      ? await db.update(reportSchedules).set(values).where(eq(reportSchedules.id, existing[0].id)).returning()
      : await db.insert(reportSchedules).values(values).returning();

    await db.insert(outboxEvents).values({
      workspaceId: membership.organizationId,
      aggregateType: "report_schedule",
      aggregateId: schedule.id,
      eventType: payload.enabled ? "report_schedule.enabled" : "report_schedule.paused",
      payload: { scheduleId: schedule.id, brandId: brand.id, cadence: schedule.cadence, recipients: schedule.recipients },
    });

    return Response.json({ ok: true, schedule: toPublicSchedule(schedule) }, { status: existing[0] ? 200 : 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof z.ZodError) return Response.json({ ok: false, error: "Report schedule details are incomplete.", issues: error.issues }, { status: 400 });
    return Response.json({ ok: false, error: "Report schedule could not be saved." }, { status: 503 });
  }
}
