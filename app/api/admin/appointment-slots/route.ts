import { z } from "zod";
import { getDb } from "@/db";
import { appointmentSlots } from "@/db/schema";
import { getAdminSession } from "@/lib/admin/access";
import { listAppointmentSlots } from "@/lib/appointment-slots";

const SlotPayload = z.object({
  label: z.string().trim().min(2).max(80),
  availableDate: z.string().trim().max(24).optional().nullable(),
  startTime: z.string().trim().min(4).max(16),
  endTime: z.string().trim().min(4).max(16),
  timezone: z.string().trim().min(3).max(80).default("Asia/Jakarta"),
  note: z.string().trim().max(160).optional().nullable(),
  status: z.enum(["active", "paused"]).default("active"),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(100),
});

export async function GET(request: Request) {
  const admin = await getAdminSession(request.headers);
  if (!admin) return Response.json({ ok: false, error: "Admin access is required." }, { status: 403 });
  return Response.json({ ok: true, slots: await listAppointmentSlots({ fallback: false }) });
}

export async function POST(request: Request) {
  const admin = await getAdminSession(request.headers);
  if (!admin) return Response.json({ ok: false, error: "Admin access is required." }, { status: 403 });
  const payload = SlotPayload.parse(await request.json());
  const [slot] = await getDb().insert(appointmentSlots).values({
    label: payload.label,
    availableDate: payload.availableDate || null,
    startTime: payload.startTime,
    endTime: payload.endTime,
    timezone: payload.timezone,
    note: payload.note || null,
    status: payload.status,
    sortOrder: payload.sortOrder,
  }).returning();
  return Response.json({ ok: true, slot }, { status: 201 });
}
