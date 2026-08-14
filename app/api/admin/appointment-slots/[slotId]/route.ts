import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { appointmentSlots } from "@/db/schema";
import { getAdminSession } from "@/lib/admin/access";

const SlotUpdatePayload = z.object({
  label: z.string().trim().min(2).max(80).optional(),
  availableDate: z.string().trim().max(24).optional().nullable(),
  startTime: z.string().trim().min(4).max(16).optional(),
  endTime: z.string().trim().min(4).max(16).optional(),
  timezone: z.string().trim().min(3).max(80).optional(),
  note: z.string().trim().max(160).optional().nullable(),
  durationMinutes: z.coerce.number().int().min(15).max(180).optional(),
  bufferMinutes: z.coerce.number().int().min(0).max(120).optional(),
  maxBookingsPerDay: z.coerce.number().int().min(1).max(20).optional(),
  ownerName: z.string().trim().max(120).optional().nullable(),
  ownerEmail: z.string().trim().email().max(160).optional().nullable().or(z.literal("")),
  meetingLocation: z.string().trim().max(200).optional().nullable(),
  status: z.enum(["active", "paused"]).optional(),
  sortOrder: z.coerce.number().int().min(0).max(1000).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const admin = await getAdminSession(request.headers);
  if (!admin) return Response.json({ ok: false, error: "Admin access is required." }, { status: 403 });
  const { slotId } = await params;
  const payload = SlotUpdatePayload.parse(await request.json());
  const [slot] = await getDb().update(appointmentSlots).set({ ...payload, updatedAt: new Date() }).where(eq(appointmentSlots.id, slotId)).returning();
  if (!slot) return Response.json({ ok: false, error: "Slot not found." }, { status: 404 });
  return Response.json({ ok: true, slot });
}
