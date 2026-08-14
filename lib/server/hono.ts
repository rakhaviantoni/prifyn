import { createHmac } from "node:crypto";
import { Hono } from "hono";
import { and, eq, isNull, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { activities, businessOrganizations, leads, outboxEvents, reportSchedules, webhookDeliveries, webhookEndpoints } from "@/db/schema";
import { adminOrderStages } from "@/lib/admin/order-flow";
import { getAdminSession } from "@/lib/admin/access";
import { productUrl, reportReadyEmail, sendEmail } from "@/lib/email/resend";
import { simpleReportPdf } from "@/lib/reports/pdf";
import { nextReportSendAt, type ReportCadence } from "@/lib/reports/schedules";
import { uploadBrandAsset } from "@/lib/storage/supabase";
import { getWorkspaceContextFromRequest } from "@/lib/workspace-context";

export const prifynService = new Hono();

function bearerAuthorized(request: Request, envName: "REPORT_SCHEDULE_SECRET" | "WEBHOOK_DELIVERY_SECRET") {
  const secret = process.env[envName];
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function webhookSignature(secret: string, body: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function matchesWebhook(events: string[], eventType: string) {
  return events.includes("*") || events.includes(eventType);
}

prifynService.post("/api/brands/logo", async c => {
  try {
    const { membership } = await getWorkspaceContextFromRequest(c.req.raw);
    const form = await c.req.formData();
    const file = form.get("logo");
    if (!(file instanceof File)) return c.json({ ok: false, error: "Choose a logo image first." }, 400);
    const logoUrl = await uploadBrandAsset(file, membership.organizationId);
    return c.json({ ok: true, logoUrl });
  } catch (error) {
    if (error instanceof Response) return error;
    return c.json({ ok: false, error: error instanceof Error ? error.message : "Logo could not be uploaded." }, 503);
  }
});

prifynService.get("/api/reports/pdf", async c => {
  try {
    const { brand } = await getWorkspaceContextFromRequest(c.req.raw);
    const url = new URL(c.req.url);
    const view = url.searchParams.get("view") || "Executive";
    const period = url.searchParams.get("period") || "Last 30 days";
    const source = url.searchParams.get("source") || "All sources";
    const outcome = url.searchParams.get("outcome") || "All outcomes";
    const pdf = simpleReportPdf([
      `Brand: ${brand.name}`,
      `View: ${view}`,
      `Period: ${period}`,
      `Source: ${source}`,
      `Outcome: ${outcome}`,
      "Decision rule: recommendations must include evidence, confidence, and next action.",
      "Add imported reports, connected channels, lead capture, and revenue data to enrich this PDF.",
    ]);
    return new Response(pdf, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="prifyn-${view.toLowerCase()}-report.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return c.json({ ok: false, error: "Report PDF could not be generated." }, 503);
  }
});

prifynService.post("/api/reports/schedules/run", async c => {
  const request = c.req.raw;
  if (!bearerAuthorized(request, "REPORT_SCHEDULE_SECRET")) return c.json({ ok: false, error: "Unauthorized." }, 401);
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

  return c.json({ ok: true, checked: due.length, results });
});

prifynService.post("/api/webhooks/deliver", async c => {
  const request = c.req.raw;
  if (!bearerAuthorized(request, "WEBHOOK_DELIVERY_SECRET")) return c.json({ ok: false, error: "Unauthorized." }, 401);
  const db = getDb();
  const events = await db.select().from(outboxEvents).where(isNull(outboxEvents.publishedAt)).limit(25);
  const endpoints = await db.select().from(webhookEndpoints).where(eq(webhookEndpoints.status, "active"));
  const deliveries: Array<{ eventId: string; endpointId: string; ok: boolean; status?: number; error?: string }> = [];

  for (const event of events) {
    const targets = endpoints.filter(endpoint => endpoint.workspaceId === event.workspaceId && matchesWebhook(endpoint.events, event.eventType));
    for (const endpoint of targets) {
      const body = JSON.stringify({
        id: event.id,
        type: event.eventType,
        version: event.eventVersion,
        occurredAt: event.occurredAt.toISOString(),
        workspaceId: event.workspaceId,
        aggregate: { type: event.aggregateType, id: event.aggregateId },
        data: event.payload,
      });
      try {
        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-prifyn-event": event.eventType,
            "x-prifyn-signature": `sha256=${webhookSignature(endpoint.secret, body)}`,
          },
          body,
        });
        const responseBody = await response.text().catch(() => "");
        await db.insert(webhookDeliveries).values({
          webhookEndpointId: endpoint.id,
          outboxEventId: event.id,
          status: response.ok ? "delivered" : "failed",
          statusCode: response.status,
          attemptCount: 1,
          responseBody: responseBody.slice(0, 2000),
          deliveredAt: response.ok ? new Date() : null,
        });
        if (response.ok) await db.update(webhookEndpoints).set({ lastDeliveredAt: new Date(), updatedAt: new Date() }).where(eq(webhookEndpoints.id, endpoint.id));
        deliveries.push({ eventId: event.id, endpointId: endpoint.id, ok: response.ok, status: response.status });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Webhook delivery failed";
        await db.insert(webhookDeliveries).values({
          webhookEndpointId: endpoint.id,
          outboxEventId: event.id,
          status: "failed",
          attemptCount: 1,
          error: message,
        });
        deliveries.push({ eventId: event.id, endpointId: endpoint.id, ok: false, error: message });
      }
    }
    if (targets.length) await db.update(outboxEvents).set({ publishedAt: new Date(), attemptCount: event.attemptCount + 1 }).where(and(eq(outboxEvents.id, event.id), isNull(outboxEvents.publishedAt)));
  }

  return c.json({ ok: true, events: events.length, deliveries });
});

prifynService.post("/api/admin/leads/:leadId/stage", async c => {
  const admin = await getAdminSession(c.req.raw.headers);
  if (!admin) return c.json({ ok: false, error: "Admin access is required." }, 403);
  const leadId = c.req.param("leadId");
  const body = await c.req.json().catch(() => ({})) as { status?: string; note?: string };
  const status = body.status?.trim();
  if (!status || !(adminOrderStages as readonly string[]).includes(status)) return c.json({ ok: false, error: "Choose a valid order stage." }, 400);

  const db = getDb();
  const [existing] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (!existing) return c.json({ ok: false, error: "Lead not found." }, 404);
  const [updated] = await db.update(leads).set({ status, updatedAt: new Date() }).where(eq(leads.id, leadId)).returning();
  await db.insert(activities).values({
    workspaceId: updated.workspaceId,
    subjectType: "lead",
    subjectId: updated.id,
    type: "admin_stage_update",
    actorUserId: admin.user.id,
    metadata: {
      previousStatus: existing.status,
      nextStatus: status,
      note: body.note || null,
    },
  });
  await db.insert(outboxEvents).values({
    workspaceId: updated.workspaceId,
    aggregateType: "lead",
    aggregateId: updated.id,
    eventType: "lead.stage_updated",
    payload: { leadId: updated.id, previousStatus: existing.status, nextStatus: status, note: body.note || null },
  });
  return c.json({ ok: true, lead: { id: updated.id, status: updated.status } });
});
