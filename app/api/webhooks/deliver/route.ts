import { createHmac } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { outboxEvents, webhookDeliveries, webhookEndpoints } from "@/db/schema";

function authorized(request: Request) {
  const secret = process.env.WEBHOOK_DELIVERY_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function signature(secret: string, body: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function matches(events: string[], eventType: string) {
  return events.includes("*") || events.includes(eventType);
}

export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const db = getDb();
  const events = await db.select().from(outboxEvents).where(isNull(outboxEvents.publishedAt)).limit(25);
  const endpoints = await db.select().from(webhookEndpoints).where(eq(webhookEndpoints.status, "active"));
  const deliveries: Array<{ eventId: string; endpointId: string; ok: boolean; status?: number; error?: string }> = [];

  for (const event of events) {
    const targets = endpoints.filter(endpoint => endpoint.workspaceId === event.workspaceId && matches(endpoint.events, event.eventType));
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
            "x-prifyn-signature": `sha256=${signature(endpoint.secret, body)}`,
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

  return Response.json({ ok: true, events: events.length, deliveries });
}
