import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { appointmentBlackoutDates } from "@/db/schema";
import { getAdminSession } from "@/lib/admin/access";

const BlackoutUpdatePayload = z.object({
  status: z.enum(["active", "paused"]).optional(),
  reason: z.string().trim().max(160).optional().nullable(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ dateId: string }> }) {
  const admin = await getAdminSession(request.headers);
  if (!admin) return Response.json({ ok: false, error: "Admin access is required." }, { status: 403 });
  const { dateId } = await params;
  const payload = BlackoutUpdatePayload.parse(await request.json());
  const [date] = await getDb().update(appointmentBlackoutDates).set({ ...payload, updatedAt: new Date() }).where(eq(appointmentBlackoutDates.id, dateId)).returning();
  if (!date) return Response.json({ ok: false, error: "Blackout date not found." }, { status: 404 });
  return Response.json({ ok: true, date });
}
