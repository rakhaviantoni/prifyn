import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { appointmentSlots } from "@/db/schema";

export type AppointmentSlot = {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  timezone: string;
  note: string;
  status: string;
  sortOrder: number;
};

export const fallbackAppointmentSlots: AppointmentSlot[] = [
  { id: "morning", label: "Morning", startTime: "09:00", endTime: "11:00", timezone: "Asia/Jakarta", note: "Best for owner-led teams", status: "active", sortOrder: 10 },
  { id: "midday", label: "Midday", startTime: "12:00", endTime: "14:00", timezone: "Asia/Jakarta", note: "Quick campaign mapping", status: "active", sortOrder: 20 },
  { id: "afternoon", label: "Afternoon", startTime: "15:00", endTime: "17:00", timezone: "Asia/Jakarta", note: "Best for team review", status: "active", sortOrder: 30 },
];

function serializeSlot(row: typeof appointmentSlots.$inferSelect): AppointmentSlot {
  return {
    id: row.id,
    label: row.label,
    startTime: row.startTime,
    endTime: row.endTime,
    timezone: row.timezone,
    note: row.note ?? "",
    status: row.status,
    sortOrder: row.sortOrder,
  };
}

export async function listAppointmentSlots({ activeOnly = false, fallback = true }: { activeOnly?: boolean; fallback?: boolean } = {}) {
  try {
    const db = getDb();
    const rows = activeOnly
      ? await db.select().from(appointmentSlots).where(eq(appointmentSlots.status, "active")).orderBy(asc(appointmentSlots.sortOrder), asc(appointmentSlots.startTime))
      : await db.select().from(appointmentSlots).orderBy(asc(appointmentSlots.sortOrder), asc(appointmentSlots.startTime));
    const slots = rows.map(serializeSlot);
    return slots.length || !fallback ? slots : fallbackAppointmentSlots;
  } catch {
    return fallback ? fallbackAppointmentSlots : [];
  }
}
