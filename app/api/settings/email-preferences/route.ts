import { eq } from "drizzle-orm";
import { z } from "zod";
import { emailPreferences } from "@/db/schema";
import { splitRecipients } from "@/lib/reports/schedules";
import { getWorkspaceContextFromRequest } from "@/lib/workspace-context";

const Payload = z.object({
  leadAlerts: z.boolean().default(true),
  reportEmails: z.boolean().default(true),
  teamInvites: z.boolean().default(true),
  billingEmails: z.boolean().default(true),
  campaignApprovals: z.boolean().default(true),
  recipients: z.union([z.string(), z.array(z.string())]).default(""),
});

function normalizeRecipients(value: string | string[]) {
  const recipients = Array.isArray(value) ? value : splitRecipients(value);
  return Array.from(new Set(recipients.filter(item => z.string().email().safeParse(item).success)));
}

export async function GET(request: Request) {
  try {
    const { db, brand } = await getWorkspaceContextFromRequest(request);
    const [row] = await db.select().from(emailPreferences).where(eq(emailPreferences.organizationId, brand.id)).limit(1);
    return Response.json({ preferences: row ?? null });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ preferences: null, error: "Email preferences could not be loaded." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = Payload.parse(await request.json());
    const { db, membership, brand } = await getWorkspaceContextFromRequest(request);
    const [existing] = await db.select().from(emailPreferences).where(eq(emailPreferences.organizationId, brand.id)).limit(1);
    const values = {
      workspaceId: membership.organizationId,
      organizationId: brand.id,
      leadAlerts: payload.leadAlerts,
      reportEmails: payload.reportEmails,
      teamInvites: payload.teamInvites,
      billingEmails: payload.billingEmails,
      campaignApprovals: payload.campaignApprovals,
      recipients: normalizeRecipients(payload.recipients),
      updatedAt: new Date(),
    };
    const [preferences] = existing
      ? await db.update(emailPreferences).set(values).where(eq(emailPreferences.id, existing.id)).returning()
      : await db.insert(emailPreferences).values(values).returning();
    return Response.json({ ok: true, preferences });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof z.ZodError) return Response.json({ ok: false, error: "Email preferences are incomplete.", issues: error.issues }, { status: 400 });
    return Response.json({ ok: false, error: "Email preferences could not be saved." }, { status: 503 });
  }
}
