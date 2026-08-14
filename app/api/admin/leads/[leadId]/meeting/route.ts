import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { activities, appointmentBookings, leads } from "@/db/schema";
import { getAdminSession } from "@/lib/admin/access";

const MeetingPayload = z.object({
  ownerName: z.string().trim().max(120).optional().nullable(),
  ownerEmail: z.string().trim().email().max(160).optional().nullable().or(z.literal("")),
  outcome: z.string().trim().max(3000).optional().nullable(),
  nextStep: z.string().trim().max(600).optional().nullable(),
  meetingStatus: z.enum(["requested", "scheduled", "completed", "reschedule_needed", "cancelled"]).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const admin = await getAdminSession(request.headers);
  if (!admin) return Response.json({ ok: false, error: "Admin access is required." }, { status: 403 });
  const { leadId } = await params;
  const payload = MeetingPayload.parse(await request.json());
  const db = getDb();
  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (!lead) return Response.json({ ok: false, error: "Lead not found." }, { status: 404 });

  await db.insert(activities).values({
    workspaceId: lead.workspaceId,
    subjectType: "lead",
    subjectId: lead.id,
    type: "meeting_outcome",
    actorUserId: admin.user.id,
    metadata: {
      ownerName: payload.ownerName || null,
      ownerEmail: payload.ownerEmail || null,
      outcome: payload.outcome || null,
      nextStep: payload.nextStep || null,
      meetingStatus: payload.meetingStatus || "scheduled",
    },
  });

  await db.update(appointmentBookings).set({
    ownerName: payload.ownerName || null,
    ownerEmail: payload.ownerEmail || null,
    status: payload.meetingStatus || "scheduled",
    updatedAt: new Date(),
  }).where(eq(appointmentBookings.leadId, lead.id));

  return Response.json({ ok: true, meeting: payload });
}
