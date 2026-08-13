import { randomUUID } from "node:crypto";
import { z } from "zod";
import { invitation } from "@/db/schema";
import { productUrl, sendEmail, teamInviteEmail } from "@/lib/email/resend";
import { getWorkspaceContextFromRequest } from "@/lib/workspace-context";

const InvitePayload = z.object({
  email: z.string().trim().email().max(160),
  role: z.string().trim().min(2).max(80),
  scope: z.string().trim().min(2).max(120).optional().nullable(),
});

function workspaceNameFromSession(name?: string | null, email?: string | null) {
  return name?.trim() || email?.split("@")[0] || "your PRIFYN workspace";
}

export async function POST(request: Request) {
  try {
    const payload = InvitePayload.parse(await request.json());
    const { db, session, membership, brands } = await getWorkspaceContextFromRequest(request);
    const inviteId = `inv_${randomUUID()}`;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    await db.insert(invitation).values({
      id: inviteId,
      organizationId: membership.organizationId,
      email: payload.email,
      role: payload.role,
      status: "pending",
      expiresAt,
      inviterId: session.user.id,
    });

    const workspaceName = brands[0]?.name && brands[0].name !== "Operating brand"
      ? brands[0].name
      : workspaceNameFromSession(session.user.name, session.user.email);
    const inviteUrl = productUrl(`/auth/sign-up?invite=${encodeURIComponent(inviteId)}`);
    const emailResult = await sendEmail(teamInviteEmail({
      to: payload.email,
      inviterName: session.user.name || session.user.email || "A workspace owner",
      workspaceName,
      role: payload.role,
      inviteUrl,
    }));

    return Response.json({
      ok: true,
      invitation: {
        id: inviteId,
        email: payload.email,
        role: payload.role,
        scope: payload.scope ?? "All operating brands",
        status: "Invited",
        expiresAt: expiresAt.toISOString(),
      },
      email: emailResult.ok ? emailResult : { ok: false, error: emailResult.error },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof z.ZodError) return Response.json({ ok: false, error: "Please enter a valid invitation email and role.", issues: error.issues }, { status: 400 });
    return Response.json({ ok: false, error: "Invitation could not be sent right now." }, { status: 503 });
  }
}
