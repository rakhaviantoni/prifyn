import { headers } from "next/headers";
import { desc, eq, sql } from "drizzle-orm";
import { campaigns } from "@/db/schema";
import { isAuthConfigured } from "@/lib/auth/server";
import { getWorkspaceContextFromHeaders } from "@/lib/workspace-context";

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
  metrics?: {
    spend: string;
    results: string;
    clicks: string;
    impressions: string;
    reach?: string;
    revenue: string;
    costPerResult?: string;
  };
  missingEvidence?: string[];
};

export type AdSummary = {
  campaignName: string;
  adSetName: string;
  adName: string;
  status: string;
  resultType: string;
  results: string;
  costPerResult: string;
  spend: string;
  impressions: string;
  reach: string;
  rawSpend: number;
  rawResults: number;
  rawImpressions: number;
  rawReach: number;
  source: string;
  action: string;
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
  reach: string | number | null;
  results: string | number | null;
  cost_per_result: string | number | null;
  period_end: Date | string | null;
};

type ImportedAdRow = {
  campaign_name: string | null;
  ad_set_name: string | null;
  ad_name: string | null;
  delivery_status: string | null;
  result_type: string | null;
  source_type: string | null;
  results: string | number | null;
  cost_per_result: string | number | null;
  spend: string | number | null;
  impressions: string | number | null;
  reach: string | number | null;
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

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: value >= 100000 ? "compact" : "standard", maximumFractionDigits: value >= 100000 ? 1 : 0 }).format(value);
}

function statusFromCampaign(status: typeof campaigns.$inferSelect.status): CampaignSummary["status"] {
  if (status === "completed") return "Completed";
  if (status === "active" || status === "ready" || status === "paused") return "Active";
  return "Draft";
}

function summarizeCampaignShell(row: typeof campaigns.$inferSelect): CampaignSummary {
  return {
    name: row.name,
    status: statusFromCampaign(row.status),
    objective: row.objectiveSummary || "Campaign objective",
    owner: "Workspace",
    creators: "No creators yet",
    revenue: "Rp 0",
    roas: "Add revenue",
    end: formatDate(row.endAt),
    note: row.objectiveSummary || "Campaign shell created. Add Ads/KOL execution and import performance reports when available.",
    nextAction: "Complete campaign brief",
    tracking: "Set tracking",
    source: "campaign",
  };
}

export async function getWorkspaceCampaignSummaries(): Promise<CampaignSummary[]> {
  if (!isAuthConfigured()) return [];
  const { db, membership, brand } = await getWorkspaceContextFromHeaders(await headers());

  try {
    const shellRows = await db.select().from(campaigns).where(eq(campaigns.organizationId, brand.id)).orderBy(desc(campaigns.createdAt)).limit(50);
    const shells = shellRows.map(summarizeCampaignShell);
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
        coalesce(sum((ir.normalized_metrics->>'reach')::numeric), 0) as reach,
        coalesce(sum((ir.normalized_metrics->>'results')::numeric), 0) as results,
        coalesce(avg((ir.normalized_metrics->>'cost_per_result_idr')::numeric), 0) as cost_per_result,
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
    const imported: CampaignSummary[] = rows
      .filter(row => row.campaign_name)
      .map(row => {
        const spend = numberValue(row.spend);
        const revenue = numberValue(row.revenue);
        const orders = numberValue(row.orders) || numberValue(row.conversions);
        const clicks = numberValue(row.clicks);
        const results = numberValue(row.results) || orders;
        const roas = spend > 0 && revenue > 0 ? `${(revenue / spend).toFixed(2)}x` : "Add revenue";
        const importedRows = numberValue(row.imported_rows);
        const campaignName = row.campaign_name ?? "Imported campaign";
        const missingEvidence = [
          clicks ? "" : "Clicks / landing visits",
          revenue ? "" : "Revenue or GMV",
          orders ? "" : "Orders / leads",
        ].filter(Boolean);
        return {
          name: campaignName,
          status: statusFromDelivery(row.delivery_status),
          objective: row.result_type || "Imported performance",
          owner: "Workspace",
          creators: "No creators yet",
          revenue: formatIdr(revenue),
          roas,
          end: formatDate(row.period_end),
          note: `${importedRows} imported ad row${importedRows === 1 ? "" : "s"} from ${sourceLabel(row.source_type)}. Spend ${formatIdr(spend)}${results ? ` · ${Math.round(results).toLocaleString("id-ID")} ${row.result_type || "results"}` : ""}.`,
          nextAction: revenue > 0 && spend > 0 ? "Review performance" : "Add outcome data",
          tracking: row.source_type ? `Imported export · ${sourceLabel(row.source_type)}` : "Imported export",
          source: "import" as const,
          importedRows,
          metrics: {
            spend: formatIdr(spend),
            results: formatNumber(results),
            clicks: clicks ? formatNumber(clicks) : "Not imported",
            impressions: formatNumber(numberValue(row.impressions)),
            reach: formatNumber(numberValue(row.reach)),
            revenue: formatIdr(revenue),
            costPerResult: numberValue(row.cost_per_result) ? formatIdr(numberValue(row.cost_per_result)) : undefined,
          },
          missingEvidence,
        };
      });
    const byName = new Map<string, CampaignSummary>();
    for (const shell of shells) byName.set(shell.name.toLowerCase(), shell);
    for (const item of imported) {
      const key = item.name.toLowerCase();
      const shell = byName.get(key);
      byName.set(key, shell ? {
        ...item,
        status: shell.status === "Draft" ? item.status : shell.status,
        objective: shell.objective || item.objective,
        owner: shell.owner,
        note: `${shell.note} Performance evidence: ${item.note}`,
        nextAction: item.nextAction,
        source: "campaign" as const,
      } : item);
    }
    return [...byName.values()];
  } catch {
    return [];
  }
}

export async function getWorkspaceAdSummaries(): Promise<AdSummary[]> {
  if (!isAuthConfigured()) return [];
  const { db, membership, brand } = await getWorkspaceContextFromHeaders(await headers());

  try {
    const result = await db.execute(sql<ImportedAdRow>`
      select
        nullif(ir.dimensions->>'campaign_name', '') as campaign_name,
        nullif(ir.dimensions->>'ad_set_name', '') as ad_set_name,
        nullif(ir.dimensions->>'ad_name', '') as ad_name,
        max(nullif(ir.dimensions->>'delivery_status', '')) as delivery_status,
        max(nullif(ir.dimensions->>'result_type', '')) as result_type,
        max(ij.source_type) as source_type,
        coalesce(sum((ir.normalized_metrics->>'results')::numeric), 0) as results,
        coalesce(avg((ir.normalized_metrics->>'cost_per_result_idr')::numeric), 0) as cost_per_result,
        coalesce(sum((ir.normalized_metrics->>'spend_idr')::numeric), 0) as spend,
        coalesce(sum((ir.normalized_metrics->>'impressions')::numeric), 0) as impressions,
        coalesce(sum((ir.normalized_metrics->>'reach')::numeric), 0) as reach
      from import_rows ir
      inner join import_jobs ij on ij.id = ir.import_job_id
      where ij.workspace_id = ${membership.organizationId}
        and ij.organization_id = ${brand.id}
        and ij.status = 'completed'
      group by nullif(ir.dimensions->>'campaign_name', ''), nullif(ir.dimensions->>'ad_set_name', ''), nullif(ir.dimensions->>'ad_name', '')
      order by max(ij.created_at) desc, campaign_name asc, ad_name asc
      limit 200
    `);
    const rows = (Array.isArray(result) ? result : []) as ImportedAdRow[];
    return rows.filter(row => row.ad_name || row.campaign_name).map(row => {
      const status = row.delivery_status || "Imported";
      const resultType = row.result_type || "Result";
      const cost = numberValue(row.cost_per_result);
      const normalized = status.toLowerCase();
      return {
        campaignName: row.campaign_name || "Imported campaign",
        adSetName: row.ad_set_name || "No ad set",
        adName: row.ad_name || row.campaign_name || "Imported ad",
        status,
        resultType,
        results: formatNumber(numberValue(row.results)),
        costPerResult: cost ? formatIdr(cost) : "—",
        spend: formatIdr(numberValue(row.spend)),
        impressions: formatNumber(numberValue(row.impressions)),
        reach: formatNumber(numberValue(row.reach)),
        rawSpend: numberValue(row.spend),
        rawResults: numberValue(row.results),
        rawImpressions: numberValue(row.impressions),
        rawReach: numberValue(row.reach),
        source: sourceLabel(row.source_type),
        action: normalized.includes("archived") ? "Keep archived" : normalized.includes("inactive") ? "Review learning" : "Monitor delivery",
      };
    });
  } catch {
    return [];
  }
}
