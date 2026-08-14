type EmailRecipient = string | string[];

type SendEmailInput = {
  to: EmailRecipient;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
  attachments?: Array<{ filename: string; content: string; contentType?: string }>;
};

type EmailResult = { ok: true; id?: string; skipped?: false } | { ok: true; skipped: true; reason: string } | { ok: false; error: string };

const defaultFrom = "PRIFYN <hello@prifyn.com>";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function productUrl(path = "/") {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "https://app.prifyn.com";
  return new URL(path, base).toString();
}

export function transactionalFrom() {
  return process.env.RESEND_FROM_EMAIL || defaultFrom;
}

export function notificationInbox() {
  return process.env.PRIFYN_NOTIFY_EMAIL || process.env.PRIFYN_INTAKE_EMAIL || "privynindonesia@gmail.com";
}

function htmlShell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f6f3ec;color:#18211d;font-family:Inter,Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f3ec;padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e7dfd2;border-radius:20px;overflow:hidden"><tr><td style="padding:28px 30px 12px"><div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#287553;font-weight:800">PRIFYN</div><h1 style="margin:10px 0 0;font-size:28px;line-height:1.15;letter-spacing:-.04em;color:#18211d">${escapeHtml(title)}</h1></td></tr><tr><td style="padding:0 30px 30px;font-size:15px;line-height:1.65;color:#4f5b54">${body}</td></tr></table></td></tr></table></body></html>`;
}

function escapeHtml(value?: string | null) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

export async function sendEmail(input: SendEmailInput): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: true, skipped: true, reason: "RESEND_API_KEY is not configured" };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: transactionalFrom(),
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo,
        tags: input.tags,
        attachments: input.attachments,
      }),
    });
    const data = await response.json().catch(() => ({})) as { id?: string; message?: string; name?: string };
    if (!response.ok) return { ok: false, error: data.message || data.name || "Resend rejected the email" };
    return { ok: true, id: data.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Email could not be sent" };
  }
}

export function leadOwnerEmail(input: {
  type: "appointment" | "application";
  name: string;
  email: string;
  company: string;
  role?: string | null;
  channel?: string | null;
  urgency?: string | null;
  spend?: string | null;
  preferredTime?: string | null;
  problem: string;
}) {
  const label = input.type === "appointment" ? "Book appointment" : "Apply online";
  const body = `<p><strong>${escapeHtml(input.company)}</strong> submitted a ${label.toLowerCase()} request.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0;border-collapse:collapse"><tr><td style="padding:9px 0;color:#7a827c">Contact</td><td style="padding:9px 0;color:#18211d;font-weight:700">${escapeHtml(input.name)} · ${escapeHtml(input.email)}</td></tr><tr><td style="padding:9px 0;color:#7a827c">Role</td><td style="padding:9px 0;color:#18211d">${escapeHtml(input.role || "Not provided")}</td></tr><tr><td style="padding:9px 0;color:#7a827c">Channel</td><td style="padding:9px 0;color:#18211d">${escapeHtml(input.channel || "Not selected")}</td></tr><tr><td style="padding:9px 0;color:#7a827c">Timing</td><td style="padding:9px 0;color:#18211d">${escapeHtml(input.urgency || "Not provided")}</td></tr><tr><td style="padding:9px 0;color:#7a827c">Spend</td><td style="padding:9px 0;color:#18211d">${escapeHtml(input.spend || "Not provided")}</td></tr>${input.preferredTime ? `<tr><td style="padding:9px 0;color:#7a827c">Preferred time</td><td style="padding:9px 0;color:#18211d">${escapeHtml(input.preferredTime)}</td></tr>` : ""}</table><p style="white-space:pre-wrap">${escapeHtml(input.problem)}</p><p><a href="${productUrl("/app/leads")}" style="display:inline-block;margin-top:12px;padding:12px 16px;border-radius:999px;background:#18211d;color:#ffffff;text-decoration:none;font-weight:800">Open Lead Inbox</a></p>`;
  return {
    to: notificationInbox(),
    subject: `New PRIFYN lead: ${input.company}`,
    html: htmlShell(`New ${label} request`, body),
    text: `${input.company} submitted ${label}. Contact: ${input.name} ${input.email}. Problem: ${input.problem}`,
    replyTo: input.email,
    tags: [{ name: "category", value: "lead" }, { name: "type", value: input.type }],
  };
}

function icsTimestamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function calendarDate(date: string, time: string) {
  return new Date(`${date}T${time}:00+07:00`);
}

function escapeIcs(value?: string | null) {
  return String(value ?? "").replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll(";", "\\;").replaceAll("\n", "\\n");
}

export function calendarInviteAttachment(input: {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location?: string | null;
  organizerEmail?: string | null;
  attendeeEmail?: string | null;
}) {
  const start = calendarDate(input.date, input.startTime);
  const end = calendarDate(input.date, input.endTime);
  const uid = `prifyn-${input.date}-${input.startTime}-${input.attendeeEmail || "guest"}@prifyn.com`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PRIFYN//Growth OS//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(uid)}`,
    `DTSTAMP:${icsTimestamp(new Date())}`,
    `DTSTART:${icsTimestamp(start)}`,
    `DTEND:${icsTimestamp(end)}`,
    `SUMMARY:${escapeIcs(input.title)}`,
    `DESCRIPTION:${escapeIcs(input.description)}`,
    `LOCATION:${escapeIcs(input.location || "Online meeting")}`,
    input.organizerEmail ? `ORGANIZER;CN=PRIFYN:mailto:${input.organizerEmail}` : "ORGANIZER;CN=PRIFYN:mailto:hello@prifyn.com",
    input.attendeeEmail ? `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${input.attendeeEmail}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
  return {
    filename: "prifyn-walkthrough.ics",
    content: Buffer.from(ics).toString("base64"),
    contentType: "text/calendar",
  };
}

export function leadConfirmationEmail(input: {
  type: "appointment" | "application";
  name: string;
  email: string;
  company: string;
  preferredTime?: string | null;
  calendarInvite?: ReturnType<typeof calendarInviteAttachment> | null;
}) {
  const isAppointment = input.type === "appointment";
  const body = `<p>Hi ${escapeHtml(input.name)},</p><p>We received your ${isAppointment ? "walkthrough request" : "application"} for <strong>${escapeHtml(input.company)}</strong>. The PRIFYN team will review your growth workflow and follow up with the clearest next step.</p>${input.preferredTime ? `<p><strong>Preferred time:</strong> ${escapeHtml(input.preferredTime)}</p>` : ""}<p>Before the call, it helps to prepare any Ads/KOL reports, campaign objectives, and current reporting pain points.</p>`;
  return {
    to: input.email,
    subject: isAppointment ? "We received your PRIFYN walkthrough request" : "We received your PRIFYN application",
    html: htmlShell("Request received", body),
    text: `Hi ${input.name}, we received your PRIFYN request for ${input.company}. We will follow up with the clearest next step.`,
    attachments: input.calendarInvite ? [input.calendarInvite] : undefined,
    tags: [{ name: "category", value: "lead_confirmation" }],
  };
}

export function meetingReminderEmail(input: { to: EmailRecipient; name: string; company: string; time: string; rescheduleUrl?: string; cancelUrl?: string }) {
  const body = `<p>Hi ${escapeHtml(input.name)},</p><p>A quick reminder for your PRIFYN walkthrough with <strong>${escapeHtml(input.company)}</strong>.</p><p><strong>${escapeHtml(input.time)}</strong></p>${input.rescheduleUrl ? `<p><a href="${input.rescheduleUrl}" style="color:#287553;font-weight:800">Reschedule</a>${input.cancelUrl ? ` · <a href="${input.cancelUrl}" style="color:#287553;font-weight:800">Cancel</a>` : ""}</p>` : ""}`;
  return {
    to: input.to,
    subject: `Reminder: PRIFYN walkthrough for ${input.company}`,
    html: htmlShell("Walkthrough reminder", body),
    text: `Reminder: PRIFYN walkthrough for ${input.company} at ${input.time}`,
    tags: [{ name: "category", value: "meeting_reminder" }],
  };
}

export function teamInviteEmail(input: { to: string; inviterName: string; workspaceName: string; role: string; inviteUrl: string }) {
  const body = `<p>${escapeHtml(input.inviterName)} invited you to join <strong>${escapeHtml(input.workspaceName)}</strong> on PRIFYN.</p><p>Your role: <strong>${escapeHtml(input.role)}</strong>.</p><p><a href="${input.inviteUrl}" style="display:inline-block;margin-top:12px;padding:12px 16px;border-radius:999px;background:#18211d;color:#ffffff;text-decoration:none;font-weight:800">Accept invitation</a></p><p style="font-size:13px;color:#7a827c">This link expires automatically. If you were not expecting this invitation, you can ignore this email.</p>`;
  return {
    to: input.to,
    subject: `Invitation to join ${input.workspaceName} on PRIFYN`,
    html: htmlShell("You are invited to PRIFYN", body),
    text: `${input.inviterName} invited you to ${input.workspaceName} as ${input.role}. Accept: ${input.inviteUrl}`,
    tags: [{ name: "category", value: "team_invite" }],
  };
}

export function reportReadyEmail(input: { to: EmailRecipient; workspaceName: string; reportName: string; reportUrl: string; summary: string }) {
  const body = `<p><strong>${escapeHtml(input.reportName)}</strong> is ready for ${escapeHtml(input.workspaceName)}.</p><p>${escapeHtml(input.summary)}</p><p><a href="${input.reportUrl}" style="display:inline-block;margin-top:12px;padding:12px 16px;border-radius:999px;background:#18211d;color:#ffffff;text-decoration:none;font-weight:800">Open report</a></p>`;
  return {
    to: input.to,
    subject: `${input.reportName} is ready`,
    html: htmlShell("Report ready", body),
    text: `${input.reportName} is ready for ${input.workspaceName}. ${input.summary} Open: ${input.reportUrl}`,
    tags: [{ name: "category", value: "report" }],
  };
}
