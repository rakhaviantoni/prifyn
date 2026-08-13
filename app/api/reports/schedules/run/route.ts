import { and, eq, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { businessOrganizations, outboxEvents, reportSchedules } from "@/db/schema";
import { productUrl, reportReadyEmail, sendEmail } from "@/lib/email/resend";
import { nextReportSendAt, type ReportCadence } from "@/lib/reports/schedules";

function authorized(request: Request) {
  const secret = process.env.REPORT_SCHEDULE_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const db = getDb();
  const now = new Date();
  const due = await db.select({
    schedule: reportSchedules,
    brandName: businessOrganizations.name,
  }).from(reportSchedules)
    .innerJoin(businessOrganizations, eq(businessOrganizations.id, reportSchedules.organizationId))
    .where(and(eq(reportSchedules.status, "active"), lte(reportSchedules.nextSendAt, now)))
    .limit(25);

  const results: Array<{ id: string; sent: boolean; error?: string }> = [];
  for (const item of due) {
    const schedule = item.schedule;
    const summary = `${schedule.name} is ready. Views: ${schedule.views.join(", ")}. Review recommendations, evidence, confidence, and missing data before scaling decisions.`;
    const result = await sendEmail(reportReadyEmail({
      to: schedule.recipients,
      workspaceName: item.brandName,
      reportName: schedule.name,
      reportUrl: productUrl("/app/reports"),
      summary,
    }));

    if (result.ok) {
      const nextSendAt = nextReportSendAt({
        cadence: schedule.cadence as ReportCadence,
        dayOfWeek: schedule.dayOfWeek,
        dayOfMonth: schedule.dayOfMonth,
        sendTime: schedule.sendTime,
        from: new Date(now.getTime() + 1000),
      });
      await db.update(reportSchedules).set({ lastSentAt: now, nextSendAt, updatedAt: now }).where(eq(reportSchedules.id, schedule.id));
      await db.insert(outboxEvents).values({
        workspaceId: schedule.workspaceId,
        aggregateType: "report_schedule",
        aggregateId: schedule.id,
        eventType: "report_schedule.sent",
        payload: { scheduleId: schedule.id, recipients: schedule.recipients, nextSendAt: nextSendAt.toISOString() },
        publishedAt: now,
      });
      results.push({ id: schedule.id, sent: true });
    } else {
      await db.insert(outboxEvents).values({
        workspaceId: schedule.workspaceId,
        aggregateType: "report_schedule",
        aggregateId: schedule.id,
        eventType: "report_schedule.failed",
        payload: { scheduleId: schedule.id, error: result.error },
        attemptCount: 1,
        lastError: result.error,
      });
      results.push({ id: schedule.id, sent: false, error: result.error });
    }
  }

  return Response.json({ ok: true, checked: due.length, results });
}
