import { desc } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { appointmentBlackoutDates } from "@/db/schema";
import { getAdminSession } from "@/lib/admin/access";

const BlackoutPayload = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().max(160).optional().nullable(),
});

export async function GET(request: Request) {
  const admin = await getAdminSession(request.headers);
  if (!admin) return Response.json({ ok: false, error: "Admin access is required." }, { status: 403 });
  const dates = await getDb().select().from(appointmentBlackoutDates).orderBy(desc(appointmentBlackoutDates.date)).limit(80);
  return Response.json({ ok: true, dates });
}

export async function POST(request: Request) {
  const admin = await getAdminSession(request.headers);
  if (!admin) return Response.json({ ok: false, error: "Admin access is required." }, { status: 403 });
  const payload = BlackoutPayload.parse(await request.json());
  const [date] = await getDb().insert(appointmentBlackoutDates).values({
    date: payload.date,
    reason: payload.reason || null,
    status: "active",
  }).onConflictDoUpdate({
    target: appointmentBlackoutDates.date,
    set: { reason: payload.reason || null, status: "active", updatedAt: new Date() },
  }).returning();
  return Response.json({ ok: true, date }, { status: 201 });
}
