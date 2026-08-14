import { listAppointmentSlots } from "@/lib/appointment-slots";

export async function GET() {
  return Response.json({ ok: true, slots: await listAppointmentSlots({ activeOnly: true }) });
}
