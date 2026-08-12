"use client";

import { useEffect, useState } from "react";
import { ChartLineUp, CheckCircle, Database, FileArrowUp, Sparkle, TrendUp } from "@phosphor-icons/react";
import { emptyMetricSummary, formatCompactNumber, formatCurrency, formatRatio, type MetricSummary } from "@/lib/metrics/summary";
import { WorkspaceLink } from "@/components/workspace-link";

function useMetricSummary() {
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
  if (loading || !summary.hasData) return <><section className="surface live-empty-panel"><div><span><Sparkle weight="fill" /></span><h2>{loading ? "Checking workspace evidence…" : "No live performance facts yet."}</h2><p>{loading ? "PRIFYN is looking for imported facts and connected account data." : "Once you import data or connect a provider, this area becomes a decision inbox: campaign risks, spend anomalies, creator follow-ups, and next-best actions with evidence and confidence."}</p></div><div className="live-empty-actions"><WorkspaceLink className="button button-dark" href="/app/settings/imports">Import report</WorkspaceLink><WorkspaceLink className="button button-outline" href="/app/ads-window">Create campaign</WorkspaceLink></div></section><section className="surface" style={{ marginTop: 20 }}><div className="surface-head"><h2>Metric foundation</h2><WorkspaceLink href="/app/reports">Open reports</WorkspaceLink></div><div className="metric-grid"><Metric label="Spend" value="Waiting" change="Import or API" /><Metric label="Reach / impressions" value="Waiting" change="Platform export" /><Metric label="Orders / leads" value="Waiting" change="Commerce or CRM" /><Metric label="ROAS confidence" value="Not scored" change="Needs evidence" /></div></section></>;

  return <><section className="surface live-empty-panel live-data-panel"><div><span><ChartLineUp weight="fill" /></span><h2>Live evidence is available.</h2><p>{summary.importCount} import batch{summary.importCount === 1 ? "" : "es"} created {summary.factCount} performance facts across {summary.sourceCount} source{summary.sourceCount === 1 ? "" : "s"}. PRIFYN can now calculate decisions from imported data.</p></div><div className="live-empty-actions"><WorkspaceLink className="button button-dark" href="/app/reports">Review reports</WorkspaceLink><WorkspaceLink className="button button-outline" href="/app/settings/imports">Import more</WorkspaceLink></div></section><section className="surface" style={{ marginTop: 20 }}><div className="surface-head"><h2>Performance from imports</h2><WorkspaceLink href="/app/reports">Open reports</WorkspaceLink></div><div className="metric-grid"><Metric label="Spend" value={formatCurrency(summary.totals.spend_idr ?? 0)} change={`${summary.sourceCount} sources`} /><Metric label="Reach / impressions" value={formatCompactNumber(summary.totals.impressions ?? summary.totals.reach ?? 0)} change="Imported delivery facts" /><Metric label="Orders / leads" value={formatCompactNumber(summary.totals.orders ?? summary.totals.conversions ?? summary.totals.results ?? 0)} change="Mapped outcomes" /><Metric label="ROAS" value={formatRatio(summary.derived.roas)} change="Revenue ÷ spend/cost" /></div></section></>;
}

export function LiveReportMetrics({ view = "Executive" }: { view?: "Executive" | "Campaigns" | "Creators" | "Attribution" | "Journey" }) {
  const { summary, loading } = useMetricSummary();
  if (loading) return <ReportShell title="Checking imported evidence…" copy="PRIFYN is reading performance facts from your workspace database." />;
  if (!summary.hasData) return <ReportShell title="No live report data yet." copy="Upload platform exports or connect provider accounts to populate this report." />;
  const hasRevenue = (summary.totals.revenue_idr ?? 0) > 0;
  const hasClicks = (summary.totals.clicks ?? 0) > 0;
  const hasCreator = summary.creator.trackedClicks > 0 || summary.creator.orders > 0 || summary.creator.creatorCost > 0;
  const title = view === "Executive" ? "Executive metrics" : view === "Campaigns" ? "Campaign performance" : view === "Attribution" ? "Attribution coverage" : view === "Creators" ? "Creator evidence" : "Journey coverage";
  const copy = view === "Creators" && !hasCreator
    ? "This workspace has imported media delivery data, but no creator-level rows yet."
    : view === "Journey" && !hasClicks
      ? "This import explains awareness delivery. Add click, landing, lead/order, or revenue evidence for a full journey view."
      : `${summary.factCount} normalized facts from ${summary.importCount} import batch${summary.importCount === 1 ? "" : "es"} are available.`;
  return <><section className="surface report-command live-report-command"><div><span className="section-kicker">{view} evidence</span><h2>{title}</h2><p>{copy}</p></div><WorkspaceLink className="button button-dark" href="/app/settings/imports">Import more</WorkspaceLink></section><section className="surface"><div className="surface-head"><h2>{view === "Attribution" ? "Available source coverage" : title}</h2><span>{summary.sourceCount} sources</span></div><div className="metric-grid">{view === "Creators" ? <><Metric label="Creator rows" value={hasCreator ? formatCompactNumber(summary.creator.trackedClicks) : "Not available"} change="Needs creator/coupon/affiliate import" /><Metric label="Creator revenue" value={formatCurrency(summary.creator.revenue)} change="Creator-attributed" /><Metric label="Creator cost" value={formatCurrency(summary.creator.creatorCost)} change="Needed for KOL ROAS" /><Metric label="Creator ROAS" value={formatRatio(summary.creator.roas)} change="Revenue ÷ creator cost" /></> : view === "Journey" ? <><Metric label="Impressions" value={formatCompactNumber(summary.totals.impressions ?? 0)} change="Awareness step" /><Metric label="Reach" value={formatCompactNumber(summary.totals.reach ?? 0)} change="Audience exposure" /><Metric label="Clicks" value={formatCompactNumber(summary.totals.clicks ?? 0)} change={hasClicks ? "Imported" : "Missing from this file"} /><Metric label="Orders / revenue" value={hasRevenue ? formatCurrency(summary.totals.revenue_idr ?? 0) : "Not available"} change="Needs conversion/order evidence" /></> : <><Metric label="Spend" value={formatCurrency(summary.totals.spend_idr ?? 0)} change={`CPC ${formatCurrency(summary.derived.cpc ?? 0)}`} /><Metric label="Impressions" value={formatCompactNumber(summary.totals.impressions ?? 0)} change={`CTR ${summary.derived.ctr === null ? "—" : `${(summary.derived.ctr * 100).toFixed(2)}%`}`} /><Metric label="Revenue" value={formatCurrency(summary.totals.revenue_idr ?? 0)} change={hasRevenue ? `ROAS ${formatRatio(summary.derived.roas)}` : "No revenue mapped"} /><Metric label="Orders / results" value={formatCompactNumber(summary.totals.orders ?? summary.totals.results ?? 0)} change={`CVR ${summary.derived.cvr === null ? "—" : `${(summary.derived.cvr * 100).toFixed(2)}%`}`} /></>}</div></section><section className="surface table-wrap" style={{ marginTop: 18 }}><div className="surface-head"><h2>{view === "Attribution" ? "Source confidence" : "Source performance"}</h2><span>Database facts</span></div><table className="data-table"><thead><tr><th>Source</th><th>Spend</th><th>Revenue</th><th>Impressions</th><th>Clicks</th><th>Orders</th><th>ROAS</th></tr></thead><tbody>{summary.bySource.map(row => <tr key={row.source}><td><strong>{row.source}</strong></td><td>{formatCurrency(row.spend)}</td><td>{formatCurrency(row.revenue)}</td><td>{formatCompactNumber(row.impressions)}</td><td>{formatCompactNumber(row.clicks)}</td><td>{formatCompactNumber(row.orders)}</td><td><strong>{formatRatio(row.roas)}</strong></td></tr>)}</tbody></table></section></>;
}

export function LiveCampaignResultMetrics() {
  const { summary } = useMetricSummary();
  if (!summary.hasData) return null;
  return <section className="surface results-decision live-results-evidence"><span><Database weight="duotone" /></span><div><small>Live imported evidence</small><h2>{summary.factCount} normalized facts are available for this workspace.</h2><p>Spend {formatCurrency(summary.totals.spend_idr ?? 0)} · Revenue {formatCurrency(summary.totals.revenue_idr ?? 0)} · ROAS {formatRatio(summary.derived.roas)}. Campaign-level split uses imported subject IDs until campaigns are matched to records.</p><div><b>{summary.importCount} imports</b><b>{summary.sourceCount} sources</b><b>{summary.bySubject.length} mapped subjects</b></div></div><WorkspaceLink className="button button-dark" href="/app/reports">Open live reports</WorkspaceLink></section>;
}

export function CreatorLivePerformance() {
  const { summary, loading } = useMetricSummary();
  if (loading) return <CreatorShell title="Checking creator evidence…" copy="PRIFYN is reading affiliate, coupon, and imported creator campaign facts." />;
  if (!summary.hasData) return <CreatorShell title="No creator performance evidence yet." copy="Creator performance will populate after affiliate/coupon imports, campaign workroom proof, or connected platform metrics exist." />;
  return <><section className="payment-kpis"><article className="surface"><ChartLineUp /><span><small>Tracked clicks</small><strong>{formatCompactNumber(summary.creator.trackedClicks)}</strong></span></article><article className="surface"><TrendUp /><span><small>Orders / results</small><strong>{formatCompactNumber(summary.creator.orders)}</strong></span></article><article className="surface"><Sparkle /><span><small>Creator ROAS</small><strong>{formatRatio(summary.creator.roas)}</strong></span></article></section><section className="surface performance-insight"><Sparkle weight="fill" /><div><span>Evidence-based insight</span><h2>Creator performance is now tied to imported business facts.</h2><p>PRIFYN found {summary.factCount} facts across {summary.importCount} import batch{summary.importCount === 1 ? "" : "es"}. Use affiliate links, coupon codes, creator screenshots, and imported order files to improve confidence.</p><small><CheckCircle /> Source-labeled database facts · revenue {formatCurrency(summary.creator.revenue)} · cost {formatCurrency(summary.creator.creatorCost)}</small></div></section></>;
}

function ReportShell({ title, copy }: { title: string; copy: string }) {
  return <section className="surface report-empty-hero"><FileArrowUp weight="duotone" /><div><h2>{title}</h2><p>{copy} PRIFYN keeps raw rows, mapping, normalized facts, and confidence separate so every recommendation can explain why.</p></div><WorkspaceLink className="button button-dark" href="/app/settings/imports">Import data</WorkspaceLink></section>;
}

function CreatorShell({ title, copy }: { title: string; copy: string }) {
  return <><section className="payment-kpis"><article className="surface"><ChartLineUp /><span><small>Tracked clicks</small><strong>Waiting</strong></span></article><article className="surface"><TrendUp /><span><small>Orders / results</small><strong>Waiting</strong></span></article><article className="surface"><Sparkle /><span><small>Campaign readiness</small><strong>Not scored</strong></span></article></section><section className="surface performance-insight"><Sparkle weight="fill" /><div><span>Evidence-based insight</span><h2>{title}</h2><p>{copy}</p><small><Database /> No production creator metric is shown until evidence exists.</small></div></section></>;
}

function Metric({ label, value, change }: { label: string; value: string; change: string }) {
  return <div className="metric-box"><span>{label}</span><strong>{value}</strong><small>{change}</small></div>;
}
