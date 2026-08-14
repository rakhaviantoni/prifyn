import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { appointmentBookings } from "@/db/schema";
import { meetingReminderEmail, productUrl, sendEmail } from "@/lib/email/resend";

function tomorrowJakarta() {
  const now = new Date();
  const jakarta = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  jakarta.setDate(jakarta.getDate() + 1);
  const year = jakarta.getFullYear();
  const month = String(jakarta.getMonth() + 1).padStart(2, "0");
  const day = String(jakarta.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function authorized(request: Request) {
  const secret = process.env.REPORT_SCHEDULE_SECRET || process.env.APPOINTMENT_REMINDER_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}` || new URL(request.url).searchParams.get("secret") === secret;
}

export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ ok: false, error: "Reminder access is required." }, { status: 403 });
  const date = tomorrowJakarta();
  const db = getDb();
  const bookings = await db.select().from(appointmentBookings).where(and(
    eq(appointmentBookings.requestedDate, date),
    eq(appointmentBookings.status, "scheduled"),
    isNull(appointmentBookings.reminderSentAt),
  )).limit(50);

  const results = [];
  for (const booking of bookings) {
    const rescheduleUrl = productUrl(`/book?reschedule=${booking.rescheduleToken}`);
    const cancelUrl = productUrl(`/book?cancel=${booking.cancelToken}`);
    const result = await sendEmail(meetingReminderEmail({
      to: booking.contactEmail,
      name: booking.contactName,
      company: booking.companyName,
      time: `${booking.requestedDate} · ${booking.startTime}–${booking.endTime} ${booking.timezone}`,
      rescheduleUrl,
      cancelUrl,
    }));
    if (result.ok) await db.update(appointmentBookings).set({ reminderSentAt: new Date(), updatedAt: new Date() }).where(eq(appointmentBookings.id, booking.id));
    results.push({ bookingId: booking.id, ok: result.ok });
  }

  return Response.json({ ok: true, date, sent: results.filter(item => item.ok).length, results });
}
