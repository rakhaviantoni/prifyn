"use client";

import { ArrowClockwise, ChartLineUp, CheckCircle, ClipboardText, Database, EnvelopeSimple, Funnel, Lightning, PlugsConnected, Sparkle, UsersThree } from "@phosphor-icons/react";
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

  async function loadBusinessOverview(showNotice = false) {
    setOverviewLoading(true);
    if (showNotice) setNotice("Refreshing PRIFYN ops data…");
    const response = await fetch("/api/admin/overview", { credentials: "include" });
    const data = await response.json().catch(() => ({})) as { ok?: boolean; overview?: Overview; error?: string };
    if (response.ok && data.overview) {
      setMetricState(data.overview.metrics);
      setRows(data.overview.leads);
      setSelected(data.overview.leads[0] ?? null);
      setImportRows(data.overview.imports);
      setOverviewLoading(false);
      if (showNotice) {
        setNotice("Ops data refreshed.");
        window.setTimeout(() => setNotice(null), 2600);
      }
    } else {
      setNotice(data.error || "PRIFYN ops data could not be loaded yet.");
      setOverviewLoading(false);
      window.setTimeout(() => setNotice(null), 3600);
    }
  }

  useEffect(() => {
    if (!loadOverview) return;
    let active = true;
    void (async () => {
      setOverviewLoading(true);
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
        setNotice(data.error || "PRIFYN ops data could not be loaded yet.");
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
    { label: "Accounts", value: metricState.users, icon: UsersThree },
    { label: "Client workspaces", value: metricState.workspaces, icon: ClipboardText },
    { label: "Brands", value: metricState.operatingBrands, icon: Sparkle },
    { label: "Open requests", value: metricState.leads, icon: Funnel },
    { label: "Report uploads", value: metricState.imports, icon: Database },
    { label: "Automations", value: metricState.webhooks, icon: PlugsConnected },
  ];

  return <div className="admin-page"><header className="admin-hero"><div><span>PRIFYN Ops Desk</span><h1>Handle every request until the next handoff is clear.</h1><p>Use this desk to follow up with prospects, confirm approvals, prepare internal briefs, and see which client reports are ready to review.</p></div><div className="admin-hero-actions"><button className="button button-light" type="button" onClick={() => loadBusinessOverview(true)} disabled={overviewLoading}><ArrowClockwise />{overviewLoading ? "Refreshing…" : "Refresh desk"}</button></div></header>{overviewLoading && <section className="surface admin-loading"><Database weight="duotone" /><div><strong>Preparing PRIFYN ops data…</strong><span>The desk is open. Leads, report uploads, and account counts will appear here when ready.</span></div></section>}<section className="admin-metrics">{metricCards.map(({ label, value, icon: Icon }) => <article className="surface" key={label}><Icon weight="duotone" /><span><strong>{value}</strong>{label}</span></article>)}</section><section className="surface admin-flow"><div><span>How PRIFYN handles a client</span><strong>New request → Discovery call / online intake → Approval → Media plan → Internal brief → Campaign operation → Reporting → Review meeting</strong><p>Every row below should make the next PRIFYN action obvious: follow up, ask for approval, prepare the brief, or review results.</p></div><div className="admin-stage-strip">{adminOrderStages.slice(0, 8).map(stage => <span key={stage}>{stageLabel(stage)}</span>)}</div></section><div className="admin-grid"><section className="surface admin-table"><div className="surface-head"><div><h2>Client requests</h2><span>{overviewLoading ? "Loading recent requests…" : `${rows.length} request${rows.length === 1 ? "" : "s"} needing review`}</span></div></div>{rows.length ? <div className="admin-lead-list">{rows.map(lead => <article key={lead.id} className={selected?.id === lead.id ? "selected" : ""}><button type="button" onClick={() => setSelected(lead)}><strong>{lead.company}</strong><span>{lead.contact} · {lead.email}</span><small>{lead.channel || lead.source} · {lead.spend || "Spend not shared yet"}</small></button><select value={lead.status} aria-label={`Stage for ${lead.company}`} onChange={event => updateStage(lead.id, event.target.value)}>{adminOrderStages.map(stage => <option value={stage} key={stage}>{stageLabel(stage)}</option>)}</select></article>)}</div> : <div className="empty-state compact"><Funnel /><h2>{overviewLoading ? "Preparing requests…" : "No client requests yet"}</h2><p>{overviewLoading ? "You can stay here while the latest requests load." : "Book appointment and Apply online submissions will appear here for PRIFYN to follow up."}</p></div>}</section><aside className="admin-side">{selected && <section className="surface admin-detail"><span className="section-kicker">Request selected</span><h2>{selected.company}</h2><p>{selected.problem || "No problem statement yet."}</p><div className="admin-detail-grid"><div><span>Contact</span><strong>{selected.contact}</strong><small>{selected.email}</small></div><div><span>Current step</span><strong>{stageLabel(selected.status)}</strong></div><div><span>Client setup</span><strong>{selected.workspace}</strong><small>{selected.brand}</small></div><div><span>Urgency</span><strong>{selected.urgency || "Not shared"}</strong></div></div><div className="admin-actions"><a className="button button-dark" href={`mailto:${selected.email}`}><EnvelopeSimple /> Email client</a><button className="button button-outline" type="button" onClick={() => updateStage(selected.id, "approval_requested")}><Lightning /> Ask approval</button><button className="button button-outline" type="button" onClick={() => updateStage(selected.id, "internal_brief")}><ClipboardText /> Prepare brief</button></div></section>}<section className="surface admin-detail"><div className="surface-head"><h2><ChartLineUp /> Latest uploaded reports</h2></div><div className="campaign-mini-list">{importRows.length ? importRows.map(item => <div className="campaign-mini" key={item.id}><i /><div><strong>{item.sourceType}</strong><span>{item.brand} · {item.acceptedRows}/{item.totalRows} rows</span></div><b>{item.status}</b></div>) : <div className="campaign-mini"><i className="warning" /><div><strong>{overviewLoading ? "Loading uploads…" : "No reports uploaded yet"}</strong><span>{overviewLoading ? "Recent client exports will appear shortly." : "Client exports appear here after PRIFYN or the client uploads them."}</span></div><b>{overviewLoading ? "Loading" : "Waiting"}</b></div>}</div></section></aside></div>{notice && <div className="toast" role="status"><CheckCircle weight="fill" />{notice}</div>}</div>;
}
