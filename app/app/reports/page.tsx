"use client";

import { useState } from "react";
import type * as React from "react";
import {
  CheckCircle, DownloadSimple, FileArrowUp, Funnel, LinkSimple, MapPin,
  Path, Sparkle, TrendUp, Users, Warning,
} from "@phosphor-icons/react";
import { LiveReportMetrics } from "@/components/metrics/live-metrics";

type ReportView = "Executive" | "Campaigns" | "Creators" | "Attribution" | "Journey";

const views: ReportView[] = ["Executive", "Campaigns", "Creators", "Attribution", "Journey"];
const reportLayers = [
  ["Performance", "Spend, reach, impressions, clicks, CTR, leads/orders, conversion rate, revenue, ROAS"],
  ["Audience", "Age, gender, device, new vs returning, source, creator audience fit"],
  ["Location", "Country, province, city, marketplace/store delivery area"],
  ["Creative", "Ad/creator asset, hook, CTA, quality ranking, engagement ranking, fatigue"],
  ["User journey", "Impression → click → landing view → lead/order → repeat transaction"],
];

export default function ReportsPage() {
  const [view, setView] = useState<ReportView>("Executive");
  const [detail, setDetail] = useState<"metrics" | "evidence" | "manual" | null>(null);

  function exportReport() {
    const rows = ["Report,Metric,Status", `${view},Spend,From performance_facts`, `${view},Reach/Impressions,From performance_facts`, `${view},Orders/Revenue,From performance_facts`, `${view},ROAS,Derived from revenue and spend`];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `prifyn-${view.toLowerCase()}-report-template.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <div className="app-content reports-page"><header className="app-page-head"><div><span>Decision reporting</span><h1>Reports</h1><p>Weekly, monthly, campaign, creator, attribution, and journey views. Reports use connected data or imported exports from the same performance fact layer.</p></div><button className="button button-outline" type="button" onClick={exportReport}><DownloadSimple /> Export template</button></header><div className="page-tabs reports-tabs" role="tablist" aria-label="Report views">{views.map(item => <button key={item} type="button" role="tab" aria-selected={view === item} className={view === item ? "active" : ""} onClick={() => setView(item)}>{item}</button>)}</div>{detail && <div className="report-explainer" role="status"><strong>{detail === "metrics" ? "How metrics are governed" : detail === "manual" ? "Manual import is supported" : "Evidence used in this report"}</strong><span>{detail === "metrics" ? "ROAS requires attributed revenue divided by ad spend or creator cost. CTR, CVR, CAC/CPA, orders, and reach are source-labeled by platform and import job." : detail === "manual" ? "Meta/TikTok/Google/Shopee/Tokopedia exports, affiliate links, UTM URLs, coupon codes, screenshots, and order files can be used before APIs are approved." : "Evidence comes from import_jobs, import_rows, import_mappings, and performance_facts."}</span><button type="button" onClick={() => setDetail(null)}>Close</button></div>}<section className="surface report-command"><div><span className="section-kicker">{view} report</span><h2>{view === "Executive" ? "What should leadership decide?" : view === "Attribution" ? "Which tracking source can we trust?" : view === "Journey" ? "Where do users drop?" : `How is ${view.toLowerCase()} performance changing?`}</h2><p>{view === "Attribution" ? "Do not wait for every API. Combine link, coupon, manual import, and platform data with source confidence." : "Each report should end with a recommendation, evidence, confidence, and next action."}</p></div><div><button className="button button-outline" type="button" onClick={() => setDetail("metrics")}>Metric definitions</button><button className="button button-dark" type="button" onClick={() => setDetail("manual")}><FileArrowUp /> Import options</button></div></section><LiveReportMetrics /><div className="app-grid" style={{ marginTop: 18 }}><section className="surface"><div className="surface-head"><h2>{view === "Journey" ? "User journey model" : "Report sections"}</h2><button type="button" onClick={() => setDetail("evidence")}>Evidence model</button></div><div className="report-insight-stack">{view === "Journey" ? <><Insight icon={<Funnel />} label="Journey funnel" title="Acquisition → engagement → destination → lead/order → repeat." copy="Built from mapped facts and source-labeled events when available." /><Insight icon={<LinkSimple />} label="Tracking source" title="Affiliate links and destination URLs can close the loop." copy="Use creator-specific URLs, UTMs, coupons, and order import before full API connections." /><Insight icon={<Sparkle />} label="Recommendation rule" title="Only recommend when evidence coverage is clear." copy="PRIFYN should say why, confidence, and limitation instead of making black-box claims." /></> : reportLayers.map(([title, copy]) => <Insight key={title} icon={iconFor(title)} label={title} title={`${title} report`} copy={copy} />)}</div></section><aside className="stack"><section className="surface"><div className="surface-head"><h2>Source priority</h2></div><div className="campaign-mini-list"><div className="campaign-mini"><i /><div><strong>Connected API</strong><span>Highest freshness and least manual error</span></div><b>High</b></div><div className="campaign-mini"><i /><div><strong>Platform export import</strong><span>Good interim source with known date range</span></div><b>Med</b></div><div className="campaign-mini"><i className="warning" /><div><strong>Screenshot proof</strong><span>Useful, but requires manual review</span></div><b>Review</b></div></div></section><section className="surface report-source-card"><CheckCircle weight="fill" /><h2>Metric spine</h2><p>Dashboard, reports, campaign result views, and creator performance read from the same normalized fact layer after imports finish.</p><div><span>Raw source preserved</span><strong>Required</strong></div><div><span>Metric mapping</span><strong>Versioned</strong></div><div><span>AI recommendation</span><strong>Explainable</strong></div></section></aside></div></div>;
}

function iconFor(title: string) {
  if (title === "Audience") return <Users />;
  if (title === "Location") return <MapPin />;
  if (title === "Creative") return <Sparkle />;
  if (title === "User journey") return <Path />;
  if (title === "Performance") return <TrendUp />;
  return <Warning />;
}

function Insight({ icon, label, title, copy }: { icon: React.ReactNode; label: string; title: string; copy: string }) {
  return <article className="visual-card"><span>{icon}{label}</span><strong>{title}</strong><p>{copy}</p></article>;
}
