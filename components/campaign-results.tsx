"use client";

import { ArrowRight, CheckCircle, CursorClick, DownloadSimple, FileArrowUp, Funnel, ImageSquare, LinkSimple, MapPin, Path, Sparkle, TrendUp, Users, Warning } from "@phosphor-icons/react";
import type * as React from "react";
import { useState } from "react";
import { formatCompactNumber, formatCurrency, formatRatio } from "@/lib/metrics/summary";
import { LiveCampaignResultMetrics, useMetricSummary } from "@/components/metrics/live-metrics";
import { WorkspaceLink } from "@/components/workspace-link";

const reportTypes = ["Performance", "Audience", "Location", "Creative", "User journey"];

export function CampaignResults({ report, onReportChange }: { report: string; onReportChange: (value: string) => void }) {
  const [notice, setNotice] = useState<string | null>(null);
  const { summary, loading } = useMetricSummary();
  const hasRevenue = (summary.totals.revenue_idr ?? 0) > 0;
  const hasClicks = (summary.totals.clicks ?? 0) > 0;
  const hasOrders = (summary.totals.orders ?? summary.totals.conversions ?? 0) > 0;
  const hasCreativeRows = summary.bySubject.length > 0;
  const notify = (value: string) => { setNotice(value); window.setTimeout(() => setNotice(null), 2400); };

  function exportReport() {
    const rows = [
      "Metric,Value",
      `Spend,${summary.totals.spend_idr ?? 0}`,
      `Reach,${summary.totals.reach ?? 0}`,
      `Impressions,${summary.totals.impressions ?? 0}`,
      `Clicks,${summary.totals.clicks ?? 0}`,
      `Revenue,${summary.totals.revenue_idr ?? 0}`,
    ];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "prifyn-campaign-results.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Campaign results exported.");
  }

  return <div className="campaign-results">
    <section className="results-command"><div><span className="section-kicker">Campaign results</span><h2>Campaign performance</h2><p>{loading ? "Checking imported reports…" : summary.hasData ? "Results use imported reports and connected channel data. PRIFYN only shows recommendations that the current data can support." : "Import a report or connect a channel to start measuring campaign results."}</p></div><div><WorkspaceLink className="button button-outline" href="/app/settings/imports"><FileArrowUp /> Import more</WorkspaceLink><button type="button" className="button button-outline" onClick={exportReport} disabled={!summary.hasData}><DownloadSimple /> Export</button></div></section>

    <LiveCampaignResultMetrics />

    {summary.hasData ? <section className="results-kpi-grid"><ResultKpi label="Spend" value={formatCurrency(summary.totals.spend_idr ?? 0)} change={`${summary.sourceCount} source${summary.sourceCount === 1 ? "" : "s"}`} tone="neutral" /><ResultKpi label="Reach" value={formatCompactNumber(summary.totals.reach ?? 0)} change="Audience reached" tone="neutral" /><ResultKpi label="Impressions" value={formatCompactNumber(summary.totals.impressions ?? 0)} change="Delivered impressions" tone="neutral" /><ResultKpi label="Results" value={formatCompactNumber(summary.totals.results ?? summary.totals.orders ?? summary.totals.conversions ?? 0)} change="Imported objective result" tone="neutral" /><ResultKpi label="ROAS" value={formatRatio(summary.derived.roas)} change={hasRevenue ? "Revenue ÷ spend" : "Add revenue data"} tone={hasRevenue ? "positive" : "neutral"} /></section> : <section className="surface empty-state"><FileArrowUp /><h2>No campaign results yet</h2><p>Upload Meta, TikTok, Google, marketplace, or affiliate exports to populate results.</p><WorkspaceLink className="button button-dark" href="/app/settings/imports">Import report</WorkspaceLink></section>}

    {summary.hasData && <section className="surface results-decision"><span>{hasRevenue && hasClicks ? <Sparkle weight="fill" /> : <Warning weight="fill" />}</span><div><small>{hasRevenue && hasClicks ? "Action available" : "Next data needed"}</small><h2>{hasRevenue && hasClicks ? "Review spend efficiency before scaling." : hasRevenue ? "Add click data to diagnose conversion quality." : "Add revenue or order data before making ROI decisions."}</h2><p>{hasRevenue && hasClicks ? `PRIFYN can compare spend ${formatCurrency(summary.totals.spend_idr ?? 0)}, clicks ${formatCompactNumber(summary.totals.clicks ?? 0)}, revenue ${formatCurrency(summary.totals.revenue_idr ?? 0)}, and ROAS ${formatRatio(summary.derived.roas)}.` : hasRevenue ? "Revenue is available, but click or landing data is missing, so PRIFYN cannot identify where users drop yet." : "The current import measures delivery and awareness. ROI, ROAS, CAC, and journey recommendations need orders, leads, or revenue."}</p><div><b>{summary.importCount} import{summary.importCount === 1 ? "" : "s"}</b><b>{hasClicks ? "Clicks available" : "Clicks missing"}</b><b>{hasRevenue ? "Revenue available" : "Revenue missing"}</b></div></div><WorkspaceLink className="button button-dark" href={hasRevenue && hasClicks ? "/app/reports" : "/app/settings/imports"}>{hasRevenue && hasClicks ? "Open reports" : "Import outcome data"} <ArrowRight /></WorkspaceLink></section>}

    <section className="surface results-report"><div className="results-report-head"><div><small>Report view</small><h2>{report}</h2></div><div className="page-tabs results-tabs" role="tablist" aria-label="Campaign result views">{reportTypes.map(item => <button type="button" role="tab" aria-selected={report === item} className={report === item ? "active" : ""} onClick={() => onReportChange(item)} key={item}>{item}</button>)}</div></div>{report === "Performance" && <PerformanceReport hasRevenue={hasRevenue} hasClicks={hasClicks} />}{report === "Audience" && <AudienceReport />}{report === "Location" && <LocationReport />}{report === "Creative" && <CreativeReport hasCreativeRows={hasCreativeRows} />}{report === "User journey" && <JourneyReport hasClicks={hasClicks} hasOrders={hasOrders} hasRevenue={hasRevenue} />}</section>
    {notice && <div className="toast" role="status"><CheckCircle weight="fill" />{notice}</div>}
  </div>;
}

function ResultKpi({ label, value, change, tone }: { label: string; value: string; change: string; tone: string }) {
  return <article className="surface result-kpi"><span>{label}</span><strong>{value}</strong><small className={tone}>{change}</small><div>{[42,55,48,71,78,83,90].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></article>;
}

function PerformanceReport({ hasRevenue, hasClicks }: { hasRevenue: boolean; hasClicks: boolean }) {
  return <div className="report-panel"><div className="evidence-strip"><TrendUp weight="duotone" /><span><strong>{hasRevenue ? "Revenue is available." : "Revenue is not available yet."}</strong>{hasClicks ? " Click data is available for CTR/CPC diagnosis." : " Add click data to calculate CTR, CPC, and journey drop-off."}</span><WorkspaceLink href="/app/settings/imports">Add data <ArrowRight /></WorkspaceLink></div><div className="report-insight-stack"><GapCard icon={<TrendUp />} title="Spend and delivery" copy="Available from ads exports: spend, reach, impressions, result count, and cost per result." /><GapCard icon={<CursorClick />} title="Click quality" copy={hasClicks ? "Clicks are available, so CTR and CPC can be reviewed." : "Missing clicks. Import clicks or landing views to compare traffic quality."} /><GapCard icon={<Sparkle />} title="ROI decision" copy={hasRevenue ? "Revenue is available, so ROAS can be reviewed." : "Missing revenue/orders. PRIFYN will not recommend budget shifts based on awareness data alone."} /></div></div>;
}

function AudienceReport() {
  return <div className="report-panel"><div className="report-insight-stack"><GapCard icon={<Users />} title="Audience report needs breakdown columns." copy="Import age, gender, device, audience, or placement breakdowns from Meta/TikTok/Google to compare audience quality." /><GapCard icon={<FileArrowUp />} title="Current import can still support reach quality." copy="Reach, impressions, frequency proxy, and cost per result can show whether delivery was efficient." /><GapCard icon={<Sparkle />} title="Next action" copy="Export Meta breakdown by age/gender or placement, then import it here." /></div></div>;
}

function LocationReport() {
  return <div className="report-panel"><div className="report-insight-stack"><GapCard icon={<MapPin />} title="Location report needs market breakdowns." copy="Import city, region, store area, or marketplace delivery-location exports to compare performance by location." /><GapCard icon={<FileArrowUp />} title="What to import next" copy="Use Meta breakdown by region/city, GA4 geography, or marketplace order location exports." /><GapCard icon={<Sparkle />} title="Decision unlocked" copy="Once location data exists, PRIFYN can recommend where to increase spend or restrict delivery." /></div></div>;
}

function CreativeReport({ hasCreativeRows }: { hasCreativeRows: boolean }) {
  return <div className="report-panel creative-report"><div className="report-insight-stack"><GapCard icon={<ImageSquare />} title={hasCreativeRows ? "Creative rows are available." : "Creative report needs ad or asset rows."} copy={hasCreativeRows ? "Use Ads Manager to compare ad-level spend, reach, result count, and cost per result." : "Import ad name, creative name, asset, hook, CTA, or quality ranking columns to compare creatives."} /><GapCard icon={<TrendUp />} title="What can be reviewed now" copy="For your Meta awareness import, compare each ad by reach, impressions, spend, results, and cost per result." /><GapCard icon={<Sparkle />} title="Next action" copy="Add quality ranking, engagement ranking, CTR, or creative labels to explain why one ad performed better." /></div></div>;
}

function JourneyReport({ hasClicks, hasOrders, hasRevenue }: { hasClicks: boolean; hasOrders: boolean; hasRevenue: boolean }) {
  const steps = [
    ["Impressions", true],
    ["Reach", true],
    ["Clicks", hasClicks],
    ["Lead / order", hasOrders],
    ["Revenue", hasRevenue],
  ] as const;
  return <div className="report-panel journey-report"><div className="journey-layout"><section><div className="panel-title"><div><h3>Journey coverage</h3><p>PRIFYN only shows funnel steps that exist in your data.</p></div><span className="status-pill"><Path /> {steps.filter(([, ready]) => ready).length}/{steps.length} steps available</span></div><div className="journey-funnel">{steps.map(([label, ready], index) => <div key={label} className={ready ? "" : "missing"} style={{ width: `${100 - index * 10}%` }}><span>{label}</span><strong>{ready ? "Available" : "Missing"}</strong><small>{ready ? "Ready to use" : "Import needed"}</small></div>)}</div></section><aside className="journey-leak"><Funnel weight="duotone" /><small>Next unlock</small><h3>{hasClicks ? "Add orders or revenue to complete the funnel." : "Add click or landing-page data next."}</h3><p>{hasClicks ? "Clicks are available, but conversion and revenue data are needed to identify where value is lost." : "Your current import explains awareness delivery. Click and landing-page data will show whether the audience took action."}</p><WorkspaceLink className="button button-dark" href="/app/settings/imports">Import journey data</WorkspaceLink></aside></div><div className="path-grid"><GapCard icon={<LinkSimple />} title="Recommended tracking" copy="Use UTM destination URLs, GA4 events, affiliate links, coupons, or order exports." /><GapCard icon={<Warning />} title="Avoid premature conclusions" copy="Do not compare ROAS or CAC until conversion and revenue data are available." /><GapCard icon={<Sparkle />} title="After import" copy="PRIFYN can identify drop-off, weak paths, and the next fix." /></div></div>;
}

function GapCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <article className="visual-card"><span>{icon}</span><strong>{title}</strong><p>{copy}</p></article>;
}
