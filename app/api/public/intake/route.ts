import { and, desc, eq, ilike, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { activities, appointmentBlackoutDates, appointmentBookings, appointmentSlots, businessOrganizations, companies, contacts, leads, organization } from "@/db/schema";
import { calendarInviteAttachment, leadConfirmationEmail, leadOwnerEmail, productUrl, sendEmail } from "@/lib/email/resend";

const IntakePayload = z.object({
  type: z.enum(["appointment", "application"]),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  company: z.string().trim().min(2).max(160),
  role: z.string().trim().max(120).optional().nullable(),
  channel: z.string().trim().max(80).optional().nullable(),
  urgency: z.string().trim().max(80).optional().nullable(),
  spend: z.string().trim().max(120).optional().nullable(),
  preferredTime: z.string().trim().max(160).optional().nullable(),
  preferredDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  selectedSlotId: z.string().trim().uuid().optional().nullable(),
  problem: z.string().trim().min(10).max(3000),
});

async function resolvePrifynBrand(db: ReturnType<typeof getDb>) {
  const workspaceId = process.env.PRIFYN_INTAKE_WORKSPACE_ID;
  const organizationId = process.env.PRIFYN_INTAKE_ORGANIZATION_ID;
  if (workspaceId && organizationId) {
    const [brand] = await db.select().from(businessOrganizations).where(and(
      eq(businessOrganizations.workspaceId, workspaceId),
      eq(businessOrganizations.id, organizationId),
    )).limit(1);
    if (brand) return { workspaceId: brand.workspaceId, brand };
  }

  const [brand] = await db.select().from(businessOrganizations).where(ilike(businessOrganizations.name, "%prifyn%")).orderBy(desc(businessOrganizations.createdAt)).limit(1);
  if (brand) return { workspaceId: brand.workspaceId, brand };

  const [workspace] = await db.select().from(organization).where(ilike(organization.name, "%prifyn%")).orderBy(desc(organization.createdAt)).limit(1);
  if (workspace) {
    const [createdBrand] = await db.insert(businessOrganizations).values({
      workspaceId: workspace.id,
      name: "PRIFYN",
      slug: "prifyn",
      type: "brand",
    }).onConflictDoNothing().returning();
    if (createdBrand) return { workspaceId: workspace.id, brand: createdBrand };
    const [existing] = await db.select().from(businessOrganizations).where(and(eq(businessOrganizations.workspaceId, workspace.id), eq(businessOrganizations.slug, "prifyn"))).limit(1);
    if (existing) return { workspaceId: workspace.id, brand: existing };
  }

  throw new Error("PRIFYN intake workspace is not configured.");
}

export async function POST(request: Request) {
  try {
    const payload = IntakePayload.parse(await request.json());
    const db = getDb();
    const { workspaceId, brand } = await resolvePrifynBrand(db);
    const source = payload.type === "appointment" ? "book_appointment" : "apply_online";
    let calendarInvite: ReturnType<typeof calendarInviteAttachment> | null = null;
    let confirmedPreferredTime = payload.preferredTime || null;

    const created = await db.transaction(async tx => {
      const [company] = await tx.insert(companies).values({
        workspaceId,
        organizationId: brand.id,
        name: payload.company,
        lifecycleStage: "lead",
      }).returning();

      const [contact] = await tx.insert(contacts).values({
        workspaceId,
        companyId: company.id,
        name: payload.name,
        email: payload.email,
        title: payload.role || null,
        source,
        consentMetadata: {
          source,
          submittedAt: new Date().toISOString(),
          path: new URL(request.url).pathname,
        },
      }).returning();

      const [lead] = await tx.insert(leads).values({
        workspaceId,
        organizationId: brand.id,
        companyId: company.id,
        contactId: contact.id,
        source,
        status: payload.type === "appointment" ? "appointment_requested" : "application_submitted",
      }).returning();

      await tx.insert(activities).values({
        workspaceId,
        subjectType: "lead",
        subjectId: lead.id,
        type: payload.type,
        metadata: {
          intakeType: payload.type,
          channel: payload.channel,
          urgency: payload.urgency,
          spend: payload.spend,
          preferredTime: payload.preferredTime,
          problem: payload.problem,
          company: payload.company,
          contactName: payload.name,
          contactEmail: payload.email,
        },
      });

      if (payload.type === "appointment" && payload.selectedSlotId) {
        const [slot] = await tx.select().from(appointmentSlots).where(and(eq(appointmentSlots.id, payload.selectedSlotId), eq(appointmentSlots.status, "active"))).limit(1);
        if (!slot) throw new Error("The selected walkthrough window is no longer available.");

        const requestedDate = payload.preferredDate || slot.availableDate;
        if (!requestedDate) throw new Error("Choose a preferred walkthrough date.");

        const [blackout] = await tx.select().from(appointmentBlackoutDates).where(and(eq(appointmentBlackoutDates.date, requestedDate), eq(appointmentBlackoutDates.status, "active"))).limit(1);
        if (blackout) throw new Error("That date is unavailable. Please choose another walkthrough date.");

        const [bookingCount] = await tx.select({ count: sql<number>`count(*)::int` }).from(appointmentBookings).where(and(
          eq(appointmentBookings.requestedDate, requestedDate),
          ne(appointmentBookings.status, "cancelled"),
        ));
        if ((bookingCount?.count ?? 0) >= slot.maxBookingsPerDay) throw new Error("That day is fully booked. Please choose another date.");

        const rescheduleToken = crypto.randomUUID();
        const cancelToken = crypto.randomUUID();
        const ownerEmail = slot.ownerEmail || process.env.PRIFYN_INTAKE_EMAIL || "privynindonesia@gmail.com";
        const ownerName = slot.ownerName || "PRIFYN Growth Team";
        const meetingLocation = slot.meetingLocation || "Online meeting";

        await tx.insert(appointmentBookings).values({
          leadId: lead.id,
          slotId: slot.id,
          requestedDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          timezone: slot.timezone,
          contactName: payload.name,
          contactEmail: payload.email,
          companyName: payload.company,
          ownerName,
          ownerEmail,
          meetingLocation,
          status: "requested",
          rescheduleToken,
          cancelToken,
        });

        confirmedPreferredTime = `${slot.label} walkthrough · ${requestedDate} · ${slot.startTime}–${slot.endTime} ${slot.timezone}`;
        calendarInvite = calendarInviteAttachment({
          title: `PRIFYN walkthrough · ${payload.company}`,
          date: requestedDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          description: `PRIFYN walkthrough for ${payload.company}. Reschedule: ${productUrl(`/book?reschedule=${rescheduleToken}`)} Cancel: ${productUrl(`/book?cancel=${cancelToken}`)}`,
          location: meetingLocation,
          organizerEmail: ownerEmail,
          attendeeEmail: payload.email,
        });

        await tx.insert(activities).values({
          workspaceId,
          subjectType: "lead",
          subjectId: lead.id,
          type: "appointment_booking_requested",
          metadata: {
            requestedDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            timezone: slot.timezone,
            slotLabel: slot.label,
            ownerName,
            ownerEmail,
            meetingLocation,
            rescheduleUrl: productUrl(`/book?reschedule=${rescheduleToken}`),
            cancelUrl: productUrl(`/book?cancel=${cancelToken}`),
          },
        });
      }

      return { company, contact, lead };
    });

    await Promise.allSettled([
      sendEmail(leadOwnerEmail(payload)),
      sendEmail(leadConfirmationEmail({
        type: payload.type,
        name: payload.name,
        email: payload.email,
        company: payload.company,
        preferredTime: confirmedPreferredTime,
        calendarInvite,
      })),
    ]);

    return Response.json({
      ok: true,
      lead: {
        id: created.lead.id,
        status: created.lead.status,
        company: created.company.name,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ ok: false, error: "Please complete the required fields.", issues: error.issues }, { status: 400 });
    if (error instanceof Error && /walkthrough|booked|available|date/i.test(error.message)) return Response.json({ ok: false, error: error.message }, { status: 409 });
    return Response.json({ ok: false, error: "PRIFYN could not save this request right now." }, { status: 503 });
  }
}
