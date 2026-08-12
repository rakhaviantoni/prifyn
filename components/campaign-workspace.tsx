"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRight, CalendarCheck, ChartLineUp, Eye, FileArrowUp, Megaphone, Plus, Sparkle, UsersThree, X } from "@phosphor-icons/react";
import type { CampaignSummary } from "@/lib/campaign-summaries";

type Campaign = CampaignSummary;
type Filter = "All campaigns" | "Active" | "Needs attention" | "Completed";

const filters: Filter[] = ["All campaigns", "Active", "Needs attention", "Completed"];

function getPrimaryAction(campaign: Campaign) {
  const campaignParam = encodeURIComponent(campaign.name);
  if (campaign.nextAction.toLowerCase().includes("brief")) {
    return {
      label: "Complete brief",
      href: `/app/kol-window?campaign=${campaignParam}&step=brief`,
      detail: "Finish objective, deliverables, compensation, tracking, and proof rules before inviting creators.",
    };
  }
  if (campaign.status === "At risk") {
    return {
      label: "Resolve blocker",
      href: `/app/talent-pipeline?campaign=${campaignParam}`,
      detail: "Open creator pipeline, review overdue submissions, request revision, or move the slot to backup talent.",
    };
  }
  if (campaign.status === "Completed") {
    return {
      label: "Archive learnings",
      href: `/app/reports?campaign=${campaignParam}`,
      detail: "Turn results, creator notes, and channel performance into reusable campaign learnings.",
    };
  }
  return {
    label: "Review next decision",
    href: `/app/reports?campaign=${campaignParam}`,
    detail: "Check spend, creator delivery, tracking confidence, and the recommended optimization before changing budget.",
  };
}

export function CampaignWorkspace({ initialCreating = false, initialCampaigns = [] }: { initialCreating?: boolean; initialCampaigns?: Campaign[] }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [filter, setFilter] = useState<Filter>("All campaigns");
  const [creating, setCreating] = useState(initialCreating);
  const [selected, setSelected] = useState<Campaign | null>(initialCampaigns[0] ?? null);
  const [isSaving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const visible = campaigns.filter(item => filter === "All campaigns" || (filter === "Needs attention" ? item.status === "At risk" || item.status === "Draft" : item.status === filter));
  const primaryAction = selected ? getPrimaryAction(selected) : null;

  function createCampaign(form: FormData) {
    const name = String(form.get("name") || "").trim();
    const end = String(form.get("end") || "").trim();
    const objective = String(form.get("objective") || "Awareness");
    const note = String(form.get("note") || "").trim();
    if (!name || !end) return;
    setSaveError(null);
    startSaving(async () => {
      try {
        const response = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, end, objective, note }),
        });
        const data = await response.json().catch(() => ({})) as { campaign?: Campaign; error?: string };
        if (!response.ok || !data.campaign) throw new Error(data.error || "Campaign could not be saved.");
        setCampaigns(current => [data.campaign!, ...current.filter(item => item.name.toLowerCase() !== data.campaign!.name.toLowerCase())]);
        setSelected(data.campaign);
        setFilter("All campaigns");
        setCreating(false);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Campaign could not be saved.");
      }
    });
  }

  return <div className="app-content"><header className="app-page-head"><div><span>Campaign operations</span><h1>Campaigns</h1><p>Manage campaign briefs, imported results, tracking, and the next action your team should take.</p></div><button className="button button-dark" type="button" onClick={() => setCreating(true)}><Plus weight="bold" /> New campaign</button></header>{campaigns.length === 0 ? <section className="surface empty-state campaign-empty-state"><FileArrowUp /><h2>No campaigns in this workspace yet</h2><p>Import Meta/TikTok/Google/Shopee/Tokopedia reports or create your first campaign.</p><div className="empty-actions"><Link className="button button-dark" href="/app/settings/imports">Import report</Link><button className="button button-outline" type="button" onClick={() => setCreating(true)}>Create campaign</button></div></section> : <div className="campaign-layout"><section><div className="page-tabs" role="tablist" aria-label="Campaign filters">{filters.map(item => <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><section className="surface table-wrap"><table className="data-table campaign-table"><thead><tr><th>Campaign</th><th>Status</th><th>Creators</th><th>Revenue</th><th>ROAS</th><th>End</th><th /></tr></thead><tbody>{visible.map(row => <tr key={row.name} className={selected?.name === row.name ? "selected-row" : ""}><td><strong>{row.name}</strong><small>{row.objective} · {row.source === "import" ? `${row.importedRows ?? 0} imported rows` : `owner: ${row.owner}`}</small></td><td><span className={`status-pill ${row.status === "At risk" ? "warning" : row.status === "Draft" || row.status === "Completed" ? "neutral" : ""}`}>{row.status}</span></td><td>{row.creators}</td><td>{row.revenue}</td><td>{row.roas}</td><td>{row.end}</td><td><button type="button" className="table-action" onClick={() => setSelected(row)}><Eye /> Detail</button></td></tr>)}</tbody></table>{visible.length === 0 && <div className="table-empty"><p>No campaigns match this filter.</p><button type="button" onClick={() => setFilter("All campaigns")}>Show all</button></div>}</section></section>{selected && primaryAction && <aside className="surface campaign-detail-panel"><span className="section-kicker">Campaign detail</span><h2>{selected.name}</h2><p>{selected.note}</p><div className="campaign-detail-grid"><div><span>Status</span><strong>{selected.status}</strong></div><div><span>Objective / result</span><strong>{selected.objective}</strong></div><div><span>Source</span><strong>{selected.source === "import" ? "Imported report" : "Campaign"}</strong></div><div><span>Tracking</span><strong>{selected.tracking}</strong></div></div><section><h3>Next action</h3><Link className="campaign-next-action actionable" href={primaryAction.href}><Sparkle weight="fill" /><span><strong>{selected.nextAction}</strong><small>{primaryAction.detail}</small></span><b>{primaryAction.label}<ArrowRight /></b></Link></section><section><h3>Launch from this campaign</h3><div className="campaign-launch-actions"><Link className="button button-dark" href={`/app/kol-window?campaign=${encodeURIComponent(selected.name)}&step=brief`}><UsersThree /> Launch KOL</Link><Link className="button button-outline" href={`/app/ads-window?campaign=${encodeURIComponent(selected.name)}&mode=create`}><Megaphone /> Create ads campaign</Link><Link className="button button-outline" href={`/app/reports?campaign=${encodeURIComponent(selected.name)}`}><ChartLineUp /> Reports</Link></div></section><section><h3>Timeline</h3>{[["Brief", selected.status === "Draft" ? "Draft" : selected.source === "import" ? "Imported report" : "Saved"], ["Execution", selected.status === "Draft" ? "Not started" : selected.status === "At risk" ? "At risk" : "In progress"], ["Results", selected.status === "Completed" || selected.source === "import" ? "Available" : "Pending"]].map(([label, value]) => <div className="campaign-timeline-row" key={label}><CalendarCheck /><span><strong>{label}</strong><small>{value}</small></span></div>)}</section></aside>}</div>}{creating && <div className="dialog-backdrop" role="presentation" onMouseDown={() => !isSaving && setCreating(false)}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="campaign-dialog-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" disabled={isSaving} onClick={() => setCreating(false)}><X /></button><span className="section-kicker">New campaign</span><h2 id="campaign-dialog-title">Create a focused growth initiative</h2><p>Create the campaign first, then launch Ads or KOL work from the detail panel.</p><form action={createCampaign} className="dialog-form"><label className="field"><span>Campaign name</span><input name="name" required autoFocus placeholder="e.g. Holiday Family Table" /></label><label className="field"><span>Objective</span><select name="objective" defaultValue="Sales / Order"><option>Awareness</option><option>Traffic</option><option>Engagement</option><option>Leads</option><option>Sales / Order</option></select></label><label className="field"><span>End date</span><input name="end" required placeholder="e.g. 18 Dec 2026" /></label><label className="field"><span>Team note</span><textarea name="note" placeholder="Context, constraint, or what this campaign should prove." /></label>{saveError && <p className="form-error">{saveError}</p>}<div className="dialog-actions"><button type="button" className="button button-outline" disabled={isSaving} onClick={() => setCreating(false)}>Cancel</button><button type="submit" className="button button-dark" disabled={isSaving}>{isSaving ? "Saving…" : "Create draft"}</button></div></form></section></div>}</div>;
}
