import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { businessOrganizations, member } from "@/db/schema";
import { getAuth, isAuthConfigured } from "@/lib/auth/server";

export type CampaignSummary = {
  name: string;
  status: "Active" | "At risk" | "Draft" | "Completed";
  objective: string;
  owner: string;
  creators: string;
  revenue: string;
  roas: string;
  end: string;
  note: string;
  nextAction: string;
  tracking: string;
  source: "import" | "campaign";
  importedRows?: number;
};

type ImportedCampaignRow = {
  campaign_name: string | null;
  delivery_status: string | null;
  result_type: string | null;
  source_type: string | null;
  imported_rows: string | number | null;
  spend: string | number | null;
  revenue: string | number | null;
  conversions: string | number | null;
  orders: string | number | null;
  clicks: string | number | null;
  impressions: string | number | null;
  period_end: Date | string | null;
};

function numberValue(value: string | number | null | undefined) {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatIdr(value: number) {
  if (!value) return "Rp 0";
  if (Math.abs(value) >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}b`;
  if (Math.abs(value) >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}m`;
  if (Math.abs(value) >= 1_000) return `Rp ${(value / 1_000).toFixed(1)}k`;
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "No end date";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "No end date";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function statusFromDelivery(delivery: string | null | undefined): CampaignSummary["status"] {
  const normalized = delivery?.toLowerCase() ?? "";
  if (/(reject|not approved|limited|error|failed)/.test(normalized)) return "At risk";
  if (/(complete|inactive|ended)/.test(normalized)) return "Completed";
  if (/(active|learning|review|scheduled)/.test(normalized)) return "Active";
  return "Active";
}

function sourceLabel(sourceType: string | null | undefined) {
  if (!sourceType) return "imported data";
  return sourceType.replace(/_/g, " ");
}

export async function getWorkspaceCampaignSummaries(): Promise<CampaignSummary[]> {
  if (!isAuthConfigured()) return [];
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return [];

  const db = getDb();
  const membership = (await db.select().from(member).where(eq(member.userId, session.user.id)).limit(1))[0];
  if (!membership) return [];

  const brand = (await db.select().from(businessOrganizations).where(eq(businessOrganizations.workspaceId, membership.organizationId)).limit(1))[0];
  if (!brand) return [];

  try {
    const result = await db.execute(sql<ImportedCampaignRow>`
      select
        nullif(ir.dimensions->>'campaign_name', '') as campaign_name,
        max(nullif(ir.dimensions->>'delivery_status', '')) as delivery_status,
        max(nullif(ir.dimensions->>'result_type', '')) as result_type,
        max(ij.source_type) as source_type,
        count(*) as imported_rows,
        coalesce(sum((ir.normalized_metrics->>'spend_idr')::numeric), 0) as spend,
        coalesce(sum((ir.normalized_metrics->>'revenue_idr')::numeric), 0) as revenue,
        coalesce(sum((ir.normalized_metrics->>'conversions')::numeric), 0) as conversions,
        coalesce(sum((ir.normalized_metrics->>'orders')::numeric), 0) as orders,
        coalesce(sum((ir.normalized_metrics->>'clicks')::numeric), 0) as clicks,
        coalesce(sum((ir.normalized_metrics->>'impressions')::numeric), 0) as impressions,
        max(nullif(ir.dimensions->>'reporting_ends', '')) as period_end
      from import_rows ir
      inner join import_jobs ij on ij.id = ir.import_job_id
      where ij.workspace_id = ${membership.organizationId}
        and ij.organization_id = ${brand.id}
        and ij.status = 'completed'
      group by nullif(ir.dimensions->>'campaign_name', '')
      order by max(ij.created_at) desc, campaign_name asc
      limit 50
    `);
    const rows = (Array.isArray(result) ? result : []) as ImportedCampaignRow[];
    return rows
      .filter(row => row.campaign_name)
      .map(row => {
        const spend = numberValue(row.spend);
        const revenue = numberValue(row.revenue);
        const orders = numberValue(row.orders) || numberValue(row.conversions);
        const roas = spend > 0 && revenue > 0 ? `${(revenue / spend).toFixed(2)}x` : "Needs revenue";
        const importedRows = numberValue(row.imported_rows);
        const campaignName = row.campaign_name ?? "Imported campaign";
        return {
          name: campaignName,
          status: statusFromDelivery(row.delivery_status),
          objective: row.result_type || "Imported performance",
          owner: "Workspace",
          creators: "Not linked",
          revenue: formatIdr(revenue),
          roas,
          end: formatDate(row.period_end),
          note: `${importedRows} imported row${importedRows === 1 ? "" : "s"} from ${sourceLabel(row.source_type)}. Spend ${formatIdr(spend)}${orders ? ` · ${Math.round(orders).toLocaleString("id-ID")} result/orders` : ""}.`,
          nextAction: revenue > 0 && spend > 0 ? "Review performance" : "Complete attribution",
          tracking: row.source_type ? `Imported export · ${sourceLabel(row.source_type)}` : "Imported export",
          source: "import",
          importedRows,
        };
      });
  } catch {
    return [];
  }
}
