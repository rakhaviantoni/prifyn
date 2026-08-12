import { and, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { campaigns } from "@/db/schema";
import { getWorkspaceCampaignSummaries } from "@/lib/campaign-summaries";
import { getWorkspaceContextFromRequest } from "@/lib/workspace-context";

const CreateCampaignPayload = z.object({
  name: z.string().trim().min(2).max(160),
  objective: z.string().trim().min(2).max(80).default("Awareness"),
  end: z.string().trim().optional(),
  note: z.string().trim().max(1000).optional(),
});

function parseDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toSummary(row: typeof campaigns.$inferSelect) {
  return {
    name: row.name,
    status: row.status === "completed" ? "Completed" as const : row.status === "active" || row.status === "ready" ? "Active" as const : "Draft" as const,
    objective: row.objectiveSummary || "Campaign objective",
    owner: "Workspace",
    creators: "Not linked",
    revenue: "Rp 0",
    roas: "Needs revenue",
    end: row.endAt ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(row.endAt) : "No end date",
    note: row.objectiveSummary || "Campaign shell created. Link Ads/KOL execution and imported reports to build performance evidence.",
    nextAction: "Complete brief",
    tracking: "Not configured",
    source: "campaign" as const,
  };
}

export async function GET(request: Request) {
  try {
    await getWorkspaceContextFromRequest(request);
    return Response.json({ campaigns: await getWorkspaceCampaignSummaries() });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ campaigns: [], reason: "database_unreachable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = CreateCampaignPayload.parse(await request.json());
    const { db, session, membership, brand } = await getWorkspaceContextFromRequest(request);
    const existing = await db.select().from(campaigns).where(and(
      eq(campaigns.workspaceId, membership.organizationId),
      eq(campaigns.organizationId, brand.id),
      ilike(campaigns.name, payload.name),
    )).orderBy(desc(campaigns.createdAt)).limit(1);
    if (existing[0]) return Response.json({ campaign: toSummary(existing[0]), duplicate: true });

    const [created] = await db.insert(campaigns).values({
      workspaceId: membership.organizationId,
      organizationId: brand.id,
      name: payload.name,
      kind: "hybrid",
      ownerUserId: session.user.id,
      status: "draft",
      endAt: parseDate(payload.end),
      objectiveSummary: payload.objective,
    }).returning();

    return Response.json({ campaign: { ...toSummary(created), note: payload.note || toSummary(created).note } }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof z.ZodError) return Response.json({ error: "Campaign data is incomplete.", details: error.flatten() }, { status: 400 });
    return Response.json({ error: "Campaign could not be saved.", reason: "database_write_failed" }, { status: 503 });
  }
}
