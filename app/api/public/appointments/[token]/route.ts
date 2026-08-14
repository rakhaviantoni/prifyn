import { or, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { activities, appointmentBookings, leads } from "@/db/schema";

const AppointmentActionPayload = z.object({
  action: z.enum(["cancel", "reschedule"]),
  preferredDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [booking] = await getDb().select().from(appointmentBookings).where(or(
    eq(appointmentBookings.rescheduleToken, token),
    eq(appointmentBookings.cancelToken, token),
  )).limit(1);
  if (!booking) return Response.json({ ok: false, error: "Booking link is no longer valid." }, { status: 404 });
  return Response.json({
    ok: true,
    booking: {
      companyName: booking.companyName,
      contactName: booking.contactName,
      requestedDate: booking.requestedDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      timezone: booking.timezone,
      status: booking.status,
    },
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = AppointmentActionPayload.parse(await request.json());
  const db = getDb();
  const [booking] = await db.select().from(appointmentBookings).where(or(
    eq(appointmentBookings.rescheduleToken, token),
    eq(appointmentBookings.cancelToken, token),
  )).limit(1);
  if (!booking) return Response.json({ ok: false, error: "Booking link is no longer valid." }, { status: 404 });
  const status = payload.action === "cancel" ? "cancelled" : "reschedule_needed";
  const [updated] = await db.update(appointmentBookings).set({ status, updatedAt: new Date() }).where(eq(appointmentBookings.id, booking.id)).returning();
  if (updated.leadId) {
    const [lead] = await db.select().from(leads).where(eq(leads.id, updated.leadId)).limit(1);
    if (lead) {
      await db.insert(activities).values({
        workspaceId: lead.workspaceId,
        subjectType: "lead",
        subjectId: updated.leadId,
        type: payload.action === "cancel" ? "appointment_cancel_requested" : "appointment_reschedule_requested",
        metadata: {
          preferredDate: payload.preferredDate || null,
          note: payload.note || null,
          previousDate: booking.requestedDate,
          previousTime: `${booking.startTime}–${booking.endTime}`,
        },
      });
    }
  }
  return Response.json({ ok: true, booking: { status: updated.status } });
}
