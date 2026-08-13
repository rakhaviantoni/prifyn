import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { webhookEndpoints } from "@/db/schema";
import { getWorkspaceContextFromRequest } from "@/lib/workspace-context";

const Payload = z.object({
  name: z.string().trim().min(2).max(120),
  url: z.string().trim().url().max(1000),
  events: z.array(z.string().trim().min(2).max(120)).default(["*"]),
  status: z.enum(["active", "paused"]).default("active"),
});

function publicEndpoint(row: typeof webhookEndpoints.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    events: row.events,
    status: row.status,
    lastDeliveredAt: row.lastDeliveredAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const { db, membership, brand } = await getWorkspaceContextFromRequest(request);
    const endpoints = await db.select().from(webhookEndpoints).where(and(
      eq(webhookEndpoints.workspaceId, membership.organizationId),
      eq(webhookEndpoints.organizationId, brand.id),
    ));
    return Response.json({ endpoints: endpoints.map(publicEndpoint) });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ endpoints: [], error: "Webhooks could not be loaded." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = Payload.parse(await request.json());
    const { db, membership, brand } = await getWorkspaceContextFromRequest(request);
    const secret = `whsec_${randomBytes(24).toString("hex")}`;
    const [endpoint] = await db.insert(webhookEndpoints).values({
      workspaceId: membership.organizationId,
      organizationId: brand.id,
      name: payload.name,
      url: payload.url,
      events: payload.events,
      status: payload.status,
      secret,
    }).returning();
    return Response.json({ ok: true, endpoint: publicEndpoint(endpoint), signingSecret: secret }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof z.ZodError) return Response.json({ ok: false, error: "Webhook details are incomplete.", issues: error.issues }, { status: 400 });
    return Response.json({ ok: false, error: "Webhook could not be saved." }, { status: 503 });
  }
}
