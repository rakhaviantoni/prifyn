"use client";

import { useEffect, useState } from "react";
import { ChartLineUp, CheckCircle, FileArrowUp, Sparkle, TrendUp } from "@phosphor-icons/react";
import { emptyMetricSummary, formatCompactNumber, formatCurrency, formatRatio, type MetricSummary } from "@/lib/metrics/summary";
import { WorkspaceLink } from "@/components/workspace-link";

export function useMetricSummary() {
  const [summary, setSummary] = useState<MetricSummary>(emptyMetricSummary());
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetch("/api/metrics")
      .then(response => response.ok ? response.json() : { summary: emptyMetricSummary() })
      .then((data: { summary?: MetricSummary }) => { if (active) setSummary(data.summary ?? emptyMetricSummary()); })
      .catch(() => { if (active) setSummary(emptyMetricSummary()); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return { summary, loading };
}

export function LiveDashboardMetrics() {
  const { summary, loading } = useMetricSummary();
  if (loading || !summary.hasData) return <><section className="surface live-empty-panel"><div><span><Sparkle weight="fill" /></span><h2>{loading ? "Checking your workspace…" : "No performance data yet."}</h2><p>{loading ? "PRIFYN is checking imported reports and connected accounts." : "Import a platform export or connect a channel to see campaign risks, spend changes, creator follow-ups, and next actions."}</p></div><div className="live-empty-actions"><WorkspaceLink className="button button-dark" href="/app/settings/imports">Import report</WorkspaceLink><WorkspaceLink className="button button-outline" href="/app/campaigns?new=true">Create campaign</WorkspaceLink></div></section><section className="surface" style={{ marginTop: 20 }}><div className="surface-head"><h2>Data needed</h2><WorkspaceLink href="/app/reports">Open reports</WorkspaceLink></div><div className="metric-grid"><Metric label="Spend" value="Waiting" change="Import ads report" /><Metric label="Reach / impressions" value="Waiting" change="Import platform export" /><Metric label="Orders / leads" value="Waiting" change="Add outcome data" /><Metric label="ROAS" value="Not ready" change="Needs revenue data" /></div></section></>;

  return <><section className="surface live-empty-panel live-data-panel"><div><span><ChartLineUp weight="fill" /></span><h2>Imported reports are ready.</h2><p>{summary.importCount} report{summary.importCount === 1 ? "" : "s"} added across {summary.sourceCount} source{summary.sourceCount === 1 ? "" : "s"}. Review what is already measurable and what data is still missing.</p></div><div className="live-empty-actions"><WorkspaceLink className="button button-dark" href="/app/reports">Review reports</WorkspaceLink><WorkspaceLink className="button button-outline" href="/app/settings/imports">Import more</WorkspaceLink></div></section><section className="surface" style={{ marginTop: 20 }}><div className="surface-head"><h2>Performance from imports</h2><WorkspaceLink href="/app/reports">Open reports</WorkspaceLink></div><div className="metric-grid"><Metric label="Spend" value={formatCurrency(summary.totals.spend_idr ?? 0)} change={`${summary.sourceCount} sources`} /><Metric label="Reach / impressions" value={formatCompactNumber(summary.totals.impressions ?? summary.totals.reach ?? 0)} change="Delivery data" /><Metric label="Leads" value={formatCompactNumber(summary.totals.lead_count ?? 0)} change={(summary.totals.lead_count ?? 0) > 0 ? "Lead data captured" : "Add lead capture"} /><Metric label="Orders / revenue" value={(summary.totals.revenue_idr ?? 0) > 0 ? formatCurrency(summary.totals.revenue_idr ?? 0) : formatCompactNumber(summary.totals.orders ?? summary.totals.conversions ?? 0)} change="Outcome data" /></div></section></>;
}

export function LiveReportMetrics({ view = "Executive" }: { view?: "Executive" | "Campaigns" | "Creators" | "Attribution" | "Journey" }) {
  const { summary, loading } = useMetricSummary();
  if (loading) return <ReportShell title="Checking imported reports…" copy="PRIFYN is preparing the report views from your workspace data." />;
  if (!summary.hasData) return <ReportShell title="No live report data yet." copy="Upload platform exports or connect provider accounts to populate this report." />;
  const hasRevenue = (summary.totals.revenue_idr ?? 0) > 0;
  const hasClicks = (summary.totals.clicks ?? 0) > 0;
  const hasCreator = summary.creator.trackedClicks > 0 || summary.creator.orders > 0 || summary.creator.creatorCost > 0;
  const title = view === "Executive" ? "Executive metrics" : view === "Campaigns" ? "Campaign performance" : view === "Attribution" ? "Attribution coverage" : view === "Creators" ? "Creator evidence" : "Journey coverage";
  const copy = view === "Creators" && !hasCreator
    ? "This workspace has imported media delivery data, but no creator-level rows yet."
    : view === "Journey" && !hasClicks
      ? "This import explains awareness delivery. Add click, landing, lead/order, or revenue evidence for a full journey view."
      : `${summary.importCount} imported report${summary.importCount === 1 ? " is" : "s are"} available for this view.`;
  return <><section className="surface"><div className="surface-head"><div><h2>{view === "Attribution" ? "Source coverage" : title}</h2><small>{copy}</small></div><WorkspaceLink href="/app/settings/imports">Add data</WorkspaceLink></div><div className="metric-grid">{metricsForView(view, summary, { hasRevenue, hasClicks, hasCreator }).map(metric => <Metric key={metric.label} {...metric} />)}</div></section><ReportChart summary={summary} view={view} /><section className="surface table-wrap" style={{ marginTop: 18 }}><div className="surface-head"><h2>{view === "Attribution" ? "Source coverage by channel" : view === "Campaigns" ? "Campaign / ad evidence" : "Source performance"}</h2><span>{summary.sourceCount} source{summary.sourceCount === 1 ? "" : "s"}</span></div><table className="data-table"><thead><tr><th>Source</th><th>Spend</th><th>Revenue</th><th>Impressions</th><th>Clicks</th><th>Leads</th><th>Orders</th><th>ROAS</th></tr></thead><tbody>{summary.bySource.map(row => <tr key={row.source}><td><strong>{row.source}</strong></td><td>{formatCurrency(row.spend)}</td><td>{formatCurrency(row.revenue)}</td><td>{formatCompactNumber(row.impressions)}</td><td>{formatCompactNumber(row.clicks)}</td><td>{formatCompactNumber(row.leads)}</td><td>{formatCompactNumber(row.orders)}</td><td><strong>{formatRatio(row.roas)}</strong></td></tr>)}</tbody></table></section></>;
}

function ReportChart({ summary, view }: { summary: MetricSummary; view: "Executive" | "Campaigns" | "Creators" | "Attribution" | "Journey" }) {
  const rows = summary.bySource.length ? summary.bySource : [{ source: "Workspace", spend: summary.totals.spend_idr ?? 0, revenue: summary.totals.revenue_idr ?? 0, impressions: summary.totals.impressions ?? 0, clicks: summary.totals.clicks ?? 0, leads: summary.totals.lead_count ?? 0, orders: summary.totals.orders ?? summary.totals.conversions ?? 0, roas: summary.derived.roas }];
  const metric = view === "Journey" ? "clicks" : view === "Attribution" ? "revenue" : view === "Creators" ? "orders" : "spend";
  const max = Math.max(...rows.map(row => Number(row[metric] ?? 0)), 1);
  return <section className="surface report-chart-card"><div className="surface-head"><div><h2>{view === "Journey" ? "Journey signal" : view === "Creators" ? "Creator outcome signal" : view === "Attribution" ? "Revenue by source" : "Spend by source"}</h2><small>Visualized from imported or connected evidence.</small></div><span className="status-pill">{rows.length} source{rows.length === 1 ? "" : "s"}</span></div><div className="report-bar-chart">{rows.slice(0, 8).map(row => { const value = Number(row[metric] ?? 0); return <article key={row.source}><div><strong>{row.source.replaceAll("_", " ")}</strong><small>{metric === "spend" || metric === "revenue" ? formatCurrency(value) : formatCompactNumber(value)}</small></div><i><b style={{ width: `${Math.max(value / max * 100, value ? 6 : 0)}%` }} /></i></article>; })}</div></section>;
}

function metricsForView(view: "Executive" | "Campaigns" | "Creators" | "Attribution" | "Journey", summary: MetricSummary, flags: { hasRevenue: boolean; hasClicks: boolean; hasCreator: boolean }) {
  const spend = summary.totals.spend_idr ?? 0;
  const impressions = summary.totals.impressions ?? 0;
  const reach = summary.totals.reach ?? 0;
  const leads = summary.totals.lead_count ?? 0;
  const results = summary.totals.orders ?? summary.totals.conversions ?? summary.totals.results ?? 0;
  if (view === "Creators") return [
    { label: "Creator rows", value: flags.hasCreator ? formatCompactNumber(summary.creator.trackedClicks) : "Not available", change: "Import creator/coupon/affiliate data" },
    { label: "Creator revenue", value: formatCurrency(summary.creator.revenue), change: "Creator-attributed" },
    { label: "Creator cost", value: formatCurrency(summary.creator.creatorCost), change: "Needed for KOL ROAS" },
    { label: "Creator ROAS", value: formatRatio(summary.creator.roas), change: "Revenue ÷ creator cost" },
  ];
  if (view === "Journey") return [
    { label: "Impressions", value: formatCompactNumber(impressions), change: "Awareness step" },
    { label: "Reach", value: formatCompactNumber(reach), change: "Audience exposure" },
    { label: "Clicks", value: formatCompactNumber(summary.totals.clicks ?? 0), change: flags.hasClicks ? "Imported" : "Add click data" },
    { label: "Leads / revenue", value: leads ? formatCompactNumber(leads) : flags.hasRevenue ? formatCurrency(summary.totals.revenue_idr ?? 0) : "Not available", change: "Add lead/order/revenue data" },
  ];
  if (view === "Campaigns") return [
    { label: "Imported campaigns/ads", value: formatCompactNumber(summary.bySubject.length), change: `${summary.importCount} report${summary.importCount === 1 ? "" : "s"}` },
    { label: "Spend", value: formatCurrency(spend), change: `${formatCompactNumber(results)} imported results` },
    { label: "Reach", value: formatCompactNumber(reach), change: `${formatCompactNumber(impressions)} impressions` },
    { label: "Cost / result", value: results ? formatCurrency(spend / results) : "—", change: "Spend ÷ imported results" },
  ];
  if (view === "Attribution") return [
    { label: "Connected sources", value: formatCompactNumber(summary.sourceCount), change: "Imported or connected" },
    { label: "Captured leads", value: formatCompactNumber(leads), change: leads ? "Lead evidence" : "Import lead capture" },
    { label: "Attributed revenue", value: formatCurrency(summary.totals.revenue_idr ?? 0), change: flags.hasRevenue ? "Ready for ROAS" : "Needs order/revenue data" },
    { label: "Tracking coverage", value: flags.hasClicks || flags.hasRevenue || leads ? "Partial" : "Delivery only", change: "Clicks/leads/revenue decide confidence" },
  ];
  return [
    { label: "Spend", value: formatCurrency(spend), change: flags.hasClicks ? `CPC ${formatCurrency(summary.derived.cpc ?? 0)}` : "Clicks not imported" },
    { label: "Reach", value: formatCompactNumber(reach || impressions), change: `${formatCompactNumber(impressions)} impressions` },
    { label: "Leads / results", value: formatCompactNumber(leads || results), change: leads ? "Lead capture" : "Imported objective" },
    { label: "Revenue", value: formatCurrency(summary.totals.revenue_idr ?? 0), change: flags.hasRevenue ? `ROAS ${formatRatio(summary.derived.roas)}` : "Add revenue data" },
  ];
}

export function LiveCampaignResultMetrics() {
  const { summary } = useMetricSummary();
  if (!summary.hasData) return null;
  return <section className="surface results-decision live-results-evidence"><span><FileArrowUp weight="duotone" /></span><div><small>Imported report</small><h2>{summary.importCount} report{summary.importCount === 1 ? "" : "s"} available for this workspace.</h2><p>Spend {formatCurrency(summary.totals.spend_idr ?? 0)} · Revenue {formatCurrency(summary.totals.revenue_idr ?? 0)} · ROAS {formatRatio(summary.derived.roas)}. Add clicks, orders, or revenue exports to unlock deeper diagnosis.</p><div><b>{summary.importCount} imports</b><b>{summary.sourceCount} sources</b><b>{summary.bySubject.length} campaigns/ads</b></div></div><WorkspaceLink className="button button-dark" href="/app/reports">Open reports</WorkspaceLink></section>;
}

export function CreatorLivePerformance() {
  const { summary, loading } = useMetricSummary();
  if (loading) return <CreatorShell title="Checking creator evidence…" copy="PRIFYN is reading affiliate, coupon, and imported creator campaign facts." />;
  if (!summary.hasData) return <CreatorShell title="No creator performance evidence yet." copy="Creator performance will populate after affiliate/coupon imports, campaign workroom proof, or connected platform metrics exist." />;
  return <><section className="payment-kpis"><article className="surface"><ChartLineUp /><span><small>Tracked clicks</small><strong>{formatCompactNumber(summary.creator.trackedClicks)}</strong></span></article><article className="surface"><TrendUp /><span><small>Orders / results</small><strong>{formatCompactNumber(summary.creator.orders)}</strong></span></article><article className="surface"><Sparkle /><span><small>Creator ROAS</small><strong>{formatRatio(summary.creator.roas)}</strong></span></article></section><section className="surface performance-insight"><Sparkle weight="fill" /><div><span>Evidence-based insight</span><h2>Creator performance is connected to imported results.</h2><p>PRIFYN found {summary.importCount} report{summary.importCount === 1 ? "" : "s"}. Use affiliate links, coupon codes, creator screenshots, and order files to improve creator attribution.</p><small><CheckCircle /> Imported reports · revenue {formatCurrency(summary.creator.revenue)} · cost {formatCurrency(summary.creator.creatorCost)}</small></div></section></>;
}

function ReportShell({ title, copy }: { title: string; copy: string }) {
  return <section className="surface report-empty-hero"><FileArrowUp weight="duotone" /><div><h2>{title}</h2><p>{copy} Every recommendation will show the source it used and what data is still missing.</p></div><WorkspaceLink className="button button-dark" href="/app/settings/imports">Import data</WorkspaceLink></section>;
}

function CreatorShell({ title, copy }: { title: string; copy: string }) {
  return <><section className="payment-kpis"><article className="surface"><ChartLineUp /><span><small>Tracked clicks</small><strong>Waiting</strong></span></article><article className="surface"><TrendUp /><span><small>Orders / results</small><strong>Waiting</strong></span></article><article className="surface"><Sparkle /><span><small>Campaign readiness</small><strong>Not scored</strong></span></article></section><section className="surface performance-insight"><Sparkle weight="fill" /><div><span>Evidence-based insight</span><h2>{title}</h2><p>{copy}</p><small><FileArrowUp /> Import creator links, coupons, proof, or order results to activate this view.</small></div></section></>;
}

function Metric({ label, value, change }: { label: string; value: string; change: string }) {
  return <div className="metric-box"><span>{label}</span><strong>{value}</strong><small>{change}</small></div>;
}
