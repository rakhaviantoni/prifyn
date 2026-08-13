import { and, desc, eq } from "drizzle-orm";
import { importJobs, performanceFacts } from "@/db/schema";
import { isAuthConfigured } from "@/lib/auth/server";
import { emptyMetricSummary, safeDivide, type MetricSummary } from "@/lib/metrics/summary";
import { getWorkspaceContextFromRequest } from "@/lib/workspace-context";

type Fact = typeof performanceFacts.$inferSelect;

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function addMetric(target: Record<string, number>, key: string, value: number) {
  target[key] = (target[key] ?? 0) + value;
}

function groupKey(fact: Fact, mode: "source" | "subject") {
  return mode === "source" ? fact.source : `${fact.subjectType}:${fact.subjectId}`;
}

function buildSummary(facts: Fact[], importCount: number): MetricSummary {
  const totals: Record<string, number> = {};
  const bySource = new Map<string, Record<string, number>>();
  const bySubject = new Map<string, { subjectId: string; subjectType: string; metrics: Record<string, number> }>();

  for (const fact of facts) {
    const value = numberValue(fact.value);
    addMetric(totals, fact.metricKey, value);

    const sourceKey = groupKey(fact, "source");
    const sourceMetrics = bySource.get(sourceKey) ?? {};
    addMetric(sourceMetrics, fact.metricKey, value);
    bySource.set(sourceKey, sourceMetrics);

    const subjectKey = groupKey(fact, "subject");
    const subjectMetrics = bySubject.get(subjectKey) ?? { subjectId: fact.subjectId, subjectType: fact.subjectType, metrics: {} };
    addMetric(subjectMetrics.metrics, fact.metricKey, value);
    bySubject.set(subjectKey, subjectMetrics);
  }

  const spend = totals.spend_idr ?? 0;
  const revenue = totals.revenue_idr ?? 0;
  const clicks = totals.clicks ?? 0;
  const impressions = totals.impressions ?? 0;
  const leads = totals.lead_count ?? 0;
  const orders = totals.orders ?? totals.conversions ?? 0;
  const outcomes = orders || leads || totals.results || 0;
  const creatorCost = totals.creator_cost_idr ?? 0;
  const metricLabels: Record<string, string> = {
    lead_count: "Leads",
    spend_idr: "Spend",
    impressions: "Impressions",
    reach: "Reach",
    clicks: "Clicks",
    results: "Results",
    conversions: "Conversions",
    orders: "Orders",
    revenue_idr: "Revenue",
    creator_cost_idr: "Creator cost",
    cost_per_result_idr: "Cost / result",
  };
  const availableMetrics = Object.entries(totals)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({ key, label: metricLabels[key] ?? key.replaceAll("_", " "), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);

  const sourceRows = Array.from(bySource.entries()).map(([source, metrics]) => {
    const sourceSpend = metrics.spend_idr ?? 0;
    const sourceRevenue = metrics.revenue_idr ?? 0;
    return {
      source,
      spend: sourceSpend,
      revenue: sourceRevenue,
      impressions: metrics.impressions ?? 0,
      clicks: metrics.clicks ?? 0,
      leads: metrics.lead_count ?? 0,
      orders: metrics.orders ?? metrics.conversions ?? 0,
      roas: safeDivide(sourceRevenue, sourceSpend),
    };
  }).sort((a, b) => b.spend - a.spend);

  const subjectRows = Array.from(bySubject.values()).map(metrics => {
    const subjectSpend = metrics.metrics.spend_idr ?? 0;
    const subjectRevenue = metrics.metrics.revenue_idr ?? 0;
    return {
      subjectId: metrics.subjectId,
      subjectType: metrics.subjectType,
      spend: subjectSpend,
      revenue: subjectRevenue,
      impressions: metrics.metrics.impressions ?? 0,
      clicks: metrics.metrics.clicks ?? 0,
      leads: metrics.metrics.lead_count ?? 0,
      orders: metrics.metrics.orders ?? metrics.metrics.conversions ?? 0,
      roas: safeDivide(subjectRevenue, subjectSpend),
    };
  }).sort((a, b) => (b.revenue + b.spend) - (a.revenue + a.spend)).slice(0, 10);

  return {
    hasData: facts.length > 0,
    totals,
    derived: {
      ctr: safeDivide(clicks, impressions),
      cvr: safeDivide(outcomes, clicks),
      roas: safeDivide(revenue, spend || creatorCost),
      cpc: safeDivide(spend, clicks),
      cpm: impressions > 0 ? spend / impressions * 1000 : null,
    },
    importCount,
    factCount: facts.length,
    sourceCount: sourceRows.length,
    availableMetrics,
    bySource: sourceRows,
    bySubject: subjectRows,
    creator: {
      trackedClicks: clicks,
      orders: outcomes,
      revenue,
      creatorCost,
      roas: safeDivide(revenue, creatorCost || spend),
    },
  };
}

export async function GET(request: Request) {
  if (!isAuthConfigured()) return Response.json({ summary: emptyMetricSummary(), reason: "auth_not_configured" }, { status: 503 });
  try {
    const { db, membership, brand } = await getWorkspaceContextFromRequest(request);

    const [facts, imports] = await Promise.all([
      db.select().from(performanceFacts).where(and(eq(performanceFacts.workspaceId, membership.organizationId), eq(performanceFacts.organizationId, brand.id))).orderBy(desc(performanceFacts.periodStart)).limit(5000),
      db.select({ id: importJobs.id }).from(importJobs).where(and(eq(importJobs.workspaceId, membership.organizationId), eq(importJobs.organizationId, brand.id))).limit(1000),
    ]);

    return Response.json({ summary: buildSummary(facts, imports.length) });
  } catch {
    return Response.json({ summary: emptyMetricSummary(), reason: "database_unreachable" }, { status: 503 });
  }
}
