"use client";

import { useState } from "react";
import type * as React from "react";
import {
  CheckCircle, DownloadSimple, FileArrowUp, Funnel, LinkSimple, MapPin,
  Path, Sparkle, TrendUp, Users, Warning,
} from "@phosphor-icons/react";
import { LiveReportMetrics } from "@/components/metrics/live-metrics";
import { WorkspaceLink } from "@/components/workspace-link";

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
  const [detail, setDetail] = useState<"metrics" | "evidence" | null>(null);
  const [source, setSource] = useState("All sources");
  const [period, setPeriod] = useState("Last 30 days");
  const [outcome, setOutcome] = useState("All outcomes");
  const [notice, setNotice] = useState<string | null>(null);

  function exportReport() {
    const rows = ["Report,Metric,Status", `${view},Spend,Imported or connected report`, `${view},Reach/Impressions,Imported or connected report`, `${view},Orders/Revenue,Needs outcome data`, `${view},ROAS,Revenue divided by spend`];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `prifyn-${view.toLowerCase()}-report-template.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function emailReport() {
    setNotice("Sending report email…");
    try {
      const response = await fetch("/api/reports/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ view, period, source, outcome }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string; email?: { skipped?: boolean } };
      if (!response.ok) throw new Error(data.error || "Report email could not be sent.");
      setNotice(data.email?.skipped ? "Report email saved. Email delivery starts after Resend is connected." : "Report email sent.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Report email could not be sent.");
    } finally {
      window.setTimeout(() => setNotice(null), 3200);
    }
  }

  return <div className="app-content reports-page"><header className="app-page-head compact-page-head"><div><span>Decision reporting</span><h1>Reports</h1><p>Campaign, creator, attribution, and journey reporting from imported exports or connected channels.</p></div><div className="app-head-actions"><button className="button button-outline" type="button" onClick={emailReport}><CheckCircle /> Email report</button><button className="button button-outline" type="button" onClick={exportReport}><DownloadSimple /> Export CSV</button><WorkspaceLink className="button button-dark" href="/app/settings/imports"><FileArrowUp /> Import data</WorkspaceLink></div></header><div className="page-tabs reports-tabs" role="tablist" aria-label="Report views">{views.map(item => <button key={item} type="button" role="tab" aria-selected={view === item} className={view === item ? "active" : ""} onClick={() => setView(item)}>{item}</button>)}</div><section className="surface reports-filter-bar" aria-label="Report filters"><label><span>Period</span><select value={period} onChange={event => setPeriod(event.target.value)}><option>Last 7 days</option><option>Last 30 days</option><option>This month</option><option>Last month</option><option>Custom range</option></select></label><label><span>Source</span><select value={source} onChange={event => setSource(event.target.value)}><option>All sources</option><option>Meta Ads</option><option>TikTok Ads</option><option>Google Ads</option><option>Shopee</option><option>Tokopedia</option><option>Affiliate / KOL</option><option>Lead capture</option></select></label><label><span>Outcome</span><select value={outcome} onChange={event => setOutcome(event.target.value)}><option>All outcomes</option><option>Awareness</option><option>Clicks</option><option>Leads</option><option>Orders</option><option>Revenue</option></select></label><button className="button button-outline" type="button" onClick={() => setDetail("evidence")}>View evidence</button></section>{detail && <div className="report-explainer compact" role="status"><strong>{detail === "metrics" ? "Metric rules" : "Evidence used"}</strong><span>{detail === "metrics" ? "ROAS needs revenue divided by spend or creator cost. CTR and CVR only appear when clicks/conversions exist." : `Current filter: ${period}, ${source}, ${outcome}. Evidence comes from imports, connections, campaign activity, links, coupons, proof, and order files.`}</span><button type="button" onClick={() => setDetail(null)}>Close</button></div>}<section className="report-action-row"><div><strong>{view === "Executive" ? "Leadership view" : view}</strong><span>{view === "Attribution" ? "Compare which source can be trusted." : view === "Journey" ? "See which funnel steps exist." : "Review what is measurable and what action comes next."}</span></div><button type="button" onClick={() => setDetail("metrics")}>Metric rules</button></section><LiveReportMetrics view={view} /><div className="app-grid" style={{ marginTop: 18 }}><section className="surface"><div className="surface-head"><h2>{view === "Journey" ? "Journey evidence needed" : view === "Creators" ? "Creator evidence needed" : "Report sections"}</h2><button type="button" onClick={() => setDetail("evidence")}>Evidence model</button></div><div className="report-insight-stack">{view === "Journey" ? <><Insight icon={<Funnel />} label="Current import" title="Meta awareness export covers impression → reach only." copy="To calculate journey drop-off, add destination URL clicks, landing-page events, leads/orders, or GA4/affiliate data." /><Insight icon={<LinkSimple />} label="Next evidence" title="Add tracked links and landing events." copy="Use UTMs, affiliate links, GA4, Meta pixel/conversions, or order import to connect delivery to business outcomes." /><Insight icon={<Sparkle />} label="Recommendation rule" title="PRIFYN will only show funnel steps when the data exists." copy="Journey recommendations unlock after click/landing/order evidence exists." /></> : view === "Creators" ? <><Insight icon={<Users />} label="Current import" title="Creator evidence connects content to outcomes." copy="Creator reports use creator name, coupon, affiliate link, proof URL, creator cost, or campaign participant data." /><Insight icon={<FileArrowUp />} label="Next evidence" title="Import affiliate/coupon or KOL performance sheet." copy="That will populate creator clicks, leads, orders, revenue, cost, ROAS, and creator-specific recommendations." /><Insight icon={<Sparkle />} label="Recommendation rule" title="Creator ranking requires creator evidence." copy="Creator ranking becomes available after creator-level evidence is present." /></> : reportLayers.map(([title, copy]) => <Insight key={title} icon={iconFor(title)} label={title} title={`${title} report`} copy={copy} />)}</div></section><aside className="stack"><section className="surface"><div className="surface-head"><h2>Share options</h2></div><div className="campaign-mini-list"><button className="campaign-mini action-row-button" type="button" onClick={exportReport}><i /><div><strong>Download CSV</strong><span>For spreadsheet review and sharing</span></div><b>Ready</b></button><button className="campaign-mini action-row-button" type="button" onClick={emailReport}><i /><div><strong>Email current report</strong><span>Send this filtered view to your email</span></div><b>Ready</b></button><div className="campaign-mini"><i className="warning" /><div><strong>Monthly PDF pack</strong><span>Executive summary PDF after report layout is approved</span></div><b>Next</b></div></div></section><section className="surface report-source-card"><CheckCircle weight="fill" /><h2>Decision rule</h2><p>Reports should end with what to do next, what evidence supports it, and what data is still missing before scaling.</p><div><span>Recommendation</span><strong>Required</strong></div><div><span>Evidence</span><strong>Visible</strong></div><div><span>Confidence</span><strong>Source-aware</strong></div></section></aside></div>{notice && <div className="toast" role="status"><CheckCircle weight="fill" />{notice}</div>}</div>;
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
