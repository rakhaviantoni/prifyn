"use client";

import { ArrowRight, Buildings, ChartLineUp, CheckCircle, Database, EnvelopeSimple, Funnel, PlugsConnected, Sparkle, UsersThree } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { adminOrderStages, stageLabel } from "@/lib/admin/order-flow";

type Lead = {
  id: string;
  status: string;
  source: string;
  company: string;
  contact: string;
  email: string;
  brand: string;
  workspace: string;
  createdAt: string;
  channel: string;
  urgency: string;
  spend: string;
  problem: string;
};

type ImportItem = { id: string; sourceType: string; status: string; acceptedRows: number; totalRows: number; brand: string; createdAt: string };
type Metrics = { users: number; workspaces: number; operatingBrands: number; leads: number; imports: number; webhooks: number };
type Overview = { metrics: Metrics; leads: Lead[]; imports: ImportItem[] };

export function AdminBusinessManager({ metrics, leads, imports, loadOverview = false }: {
  metrics: Metrics;
  leads: Lead[];
  imports: ImportItem[];
  loadOverview?: boolean;
}) {
  const [metricState, setMetricState] = useState(metrics);
  const [rows, setRows] = useState(leads);
  const [importRows, setImportRows] = useState(imports);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<Lead | null>(leads[0] ?? null);
  const [overviewLoading, setOverviewLoading] = useState(loadOverview);

  useEffect(() => {
    if (!loadOverview) return;
    let active = true;
    void (async () => {
      const response = await fetch("/api/admin/overview", { credentials: "include" });
      const data = await response.json().catch(() => ({})) as { ok?: boolean; overview?: Overview; error?: string };
      if (!active) return;
      if (response.ok && data.overview) {
        setMetricState(data.overview.metrics);
        setRows(data.overview.leads);
        setSelected(data.overview.leads[0] ?? null);
        setImportRows(data.overview.imports);
        setOverviewLoading(false);
      } else {
        setNotice(data.error || "Business Manager data could not be loaded yet.");
        setOverviewLoading(false);
        window.setTimeout(() => setNotice(null), 3600);
      }
    })();
    return () => { active = false; };
  }, [loadOverview]);

  async function updateStage(leadId: string, status: string) {
    setNotice("Updating order stage…");
    const response = await fetch(`/api/admin/leads/${leadId}/stage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status, note: "Updated from PRIFYN Business Manager." }),
    });
    const data = await response.json().catch(() => ({})) as { error?: string; lead?: { status: string } };
    if (!response.ok || !data.lead) {
      setNotice(data.error || "Stage could not be updated.");
    } else {
      setRows(current => current.map(item => item.id === leadId ? { ...item, status: data.lead!.status } : item));
      setSelected(current => current?.id === leadId ? { ...current, status: data.lead!.status } : current);
      setNotice("Order stage updated.");
    }
    window.setTimeout(() => setNotice(null), 2600);
  }

  const metricCards = [
    { label: "Users", value: metricState.users, icon: UsersThree },
    { label: "Workspaces", value: metricState.workspaces, icon: Buildings },
    { label: "Operating brands", value: metricState.operatingBrands, icon: Sparkle },
    { label: "Leads", value: metricState.leads, icon: Funnel },
    { label: "Imports", value: metricState.imports, icon: Database },
    { label: "Webhooks", value: metricState.webhooks, icon: PlugsConnected },
  ];

  return <div className="admin-page"><header className="admin-hero"><div><span>PRIFYN Business Manager</span><h1>Operate every client from first request to reporting.</h1><p>Track prospects, client accounts, imports, reporting readiness, and the next operational handoff in one PRIFYN-side workspace.</p></div><a className="button button-light" href="/app">Open client workspace <ArrowRight /></a></header>{overviewLoading && <section className="surface admin-loading"><Database weight="duotone" /><div><strong>Loading Business Manager data…</strong><span>You can stay on this page while PRIFYN prepares the latest leads, imports, and workspace counts.</span></div></section>}<section className="admin-metrics">{metricCards.map(({ label, value, icon: Icon }) => <article className="surface" key={label}><Icon weight="duotone" /><span><strong>{value}</strong>{label}</span></article>)}</section><section className="surface admin-flow"><div><span>Client order flow</span><strong>Intake → Meeting / Online Request → Approval → Media Plan → Internal Brief → Ad Operation → Running → Reporting → Client Review</strong><p>Use this flow to keep each lead clear: who owns it, what stage it is in, and what PRIFYN should do next.</p></div></section><div className="admin-grid"><section className="surface admin-table"><div className="surface-head"><div><h2>Lead & order pipeline</h2><span>{overviewLoading ? "Loading recent leads…" : `${rows.length} recent lead${rows.length === 1 ? "" : "s"}`}</span></div></div>{rows.length ? <div className="admin-lead-list">{rows.map(lead => <article key={lead.id} className={selected?.id === lead.id ? "selected" : ""}><button type="button" onClick={() => setSelected(lead)}><strong>{lead.company}</strong><span>{lead.contact} · {lead.email}</span><small>{lead.channel || lead.source} · {lead.spend || "Spend unknown"}</small></button><select value={lead.status} aria-label={`Stage for ${lead.company}`} onChange={event => updateStage(lead.id, event.target.value)}>{adminOrderStages.map(stage => <option value={stage} key={stage}>{stageLabel(stage)}</option>)}</select></article>)}</div> : <div className="empty-state compact"><Funnel /><h2>{overviewLoading ? "Preparing leads…" : "No leads yet"}</h2><p>{overviewLoading ? "The page is ready. Lead data will appear here when the overview finishes loading." : "Book appointment and Apply online submissions will appear here."}</p></div>}</section><aside className="admin-side">{selected && <section className="surface admin-detail"><span className="section-kicker">Selected account</span><h2>{selected.company}</h2><p>{selected.problem || "No problem statement yet."}</p><div className="admin-detail-grid"><div><span>Contact</span><strong>{selected.contact}</strong><small>{selected.email}</small></div><div><span>Stage</span><strong>{stageLabel(selected.status)}</strong></div><div><span>Workspace</span><strong>{selected.workspace}</strong><small>{selected.brand}</small></div><div><span>Timing</span><strong>{selected.urgency || "Not set"}</strong></div></div><div className="admin-actions"><a className="button button-dark" href={`mailto:${selected.email}`}><EnvelopeSimple /> Email client</a><button className="button button-outline" type="button" onClick={() => updateStage(selected.id, "approval_requested")}>Send for approval</button><button className="button button-outline" type="button" onClick={() => updateStage(selected.id, "internal_brief")}>Create internal brief</button></div></section>}<section className="surface admin-detail"><div className="surface-head"><h2><ChartLineUp /> Recent imports</h2></div><div className="campaign-mini-list">{importRows.length ? importRows.map(item => <div className="campaign-mini" key={item.id}><i /><div><strong>{item.sourceType}</strong><span>{item.brand} · {item.acceptedRows}/{item.totalRows} rows</span></div><b>{item.status}</b></div>) : <div className="campaign-mini"><i className="warning" /><div><strong>{overviewLoading ? "Loading imports…" : "No imports yet"}</strong><span>{overviewLoading ? "Recent client exports will appear shortly." : "Client exports will appear after upload."}</span></div><b>{overviewLoading ? "Loading" : "Waiting"}</b></div>}</div></section></aside></div>{notice && <div className="toast" role="status"><CheckCircle weight="fill" />{notice}</div>}</div>;
}
