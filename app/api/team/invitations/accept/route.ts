import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { invitation, member } from "@/db/schema";
import { getAuth } from "@/lib/auth/server";
import { getDb } from "@/db";

const Payload = z.object({ inviteId: z.string().trim().min(4).max(120) });

export async function POST(request: Request) {
  try {
    const payload = Payload.parse(await request.json());
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session?.user?.email) return Response.json({ ok: false, error: "Sign in before accepting this invitation." }, { status: 401 });
    const db = getDb();
    const [invite] = await db.select().from(invitation).where(and(
      eq(invitation.id, payload.inviteId),
      eq(invitation.email, session.user.email),
    )).limit(1);
    if (!invite) return Response.json({ ok: false, error: "Invitation not found for this email." }, { status: 404 });
    if (invite.status === "accepted") return Response.json({ ok: true, status: "accepted" });
    if (invite.expiresAt < new Date()) return Response.json({ ok: false, error: "This invitation has expired. Ask the owner to resend it." }, { status: 410 });

    const existing = await db.select().from(member).where(and(
      eq(member.organizationId, invite.organizationId),
      eq(member.userId, session.user.id),
    )).limit(1);
    if (!existing[0]) {
      await db.insert(member).values({
        id: `mem_${randomUUID()}`,
        organizationId: invite.organizationId,
        userId: session.user.id,
        role: invite.role || "member",
      });
    }
    await db.update(invitation).set({ status: "accepted" }).where(eq(invitation.id, invite.id));
    return Response.json({ ok: true, status: "accepted" });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ ok: false, error: "Invitation link is invalid.", issues: error.issues }, { status: 400 });
    return Response.json({ ok: false, error: "Invitation could not be accepted." }, { status: 503 });
  }
}
