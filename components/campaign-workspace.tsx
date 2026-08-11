"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarCheck, ChartLineUp, Eye, Megaphone, Plus, Sparkle, UsersThree, X } from "@phosphor-icons/react";

type Campaign = {
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
};
type Filter = "All campaigns" | "Active" | "Needs attention" | "Completed";

const initialCampaigns: Campaign[] = [
  { name: "Ramadan Made Simple", status: "Active", objective: "Sales / Order", owner: "Maya Putri", creators: "8 creators", revenue: "Rp 28.4m", roas: "4.1x", end: "16 Aug 2026", note: "KOL and paid media share the same Ramadan offer. Keep creator tone warm, not too hard-sell.", nextAction: "Approve final creator slot", tracking: "Affiliate links + Meta draft + manual order import" },
  { name: "Weekend Family Feast", status: "At risk", objective: "Engagement", owner: "Raka Wijaya", creators: "5 creators", revenue: "Rp 12.8m", roas: "2.7x", end: "9 Aug 2026", note: "One creator submission is overdue. Paid spend should not scale until the content queue is stable.", nextAction: "Resolve overdue draft", tracking: "UTM links + creator proof screenshots" },
  { name: "Lunch Box Launch", status: "Active", objective: "Traffic", owner: "Maya Putri", creators: "12 creators", revenue: "Rp 36.2m", roas: "3.2x", end: "28 Aug 2026", note: "Google broad spend is getting expensive. Creator-led Meta placements still have headroom.", nextAction: "Review spend shift", tracking: "Destination URL + GA4 planned" },
  { name: "Back to School", status: "Draft", objective: "Awareness", owner: "Unassigned", creators: "0 creators", revenue: "Rp 0", roas: "-", end: "3 Sep 2026", note: "Draft created from Campaigns. Launch KOL or Ads when the brief is ready.", nextAction: "Complete brief", tracking: "Not configured" },
  { name: "Everyday Iftar", status: "Completed", objective: "Sales / Order", owner: "Maya Putri", creators: "7 creators", revenue: "Rp 31.6m", roas: "3.8x", end: "28 Mar 2026", note: "Reusable creator angle for family cooking. Good reference for future briefs.", nextAction: "Archive learnings", tracking: "Coupon code + manual proof" },
];

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

export function CampaignWorkspace({ initialCreating = false }: { initialCreating?: boolean }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [filter, setFilter] = useState<Filter>("All campaigns");
  const [creating, setCreating] = useState(initialCreating);
  const [selected, setSelected] = useState<Campaign>(initialCampaigns[0]);
  const visible = campaigns.filter(item => filter === "All campaigns" || (filter === "Needs attention" ? item.status === "At risk" || item.status === "Draft" : item.status === filter));
  const primaryAction = getPrimaryAction(selected);

  function createCampaign(form: FormData) {
    const name = String(form.get("name") || "").trim();
    const end = String(form.get("end") || "").trim();
    const objective = String(form.get("objective") || "Awareness");
    const note = String(form.get("note") || "").trim();
    if (!name || !end) return;
    const draft: Campaign = { name, status: "Draft", objective, owner: "Unassigned", creators: "0 creators", revenue: "Rp 0", roas: "-", end, note: note || "New draft campaign. Add a brief, channel plan, and tracking method before launch.", nextAction: "Complete brief", tracking: "Not configured" };
    setCampaigns(current => [draft, ...current]);
    setSelected(draft);
    setFilter("All campaigns");
    setCreating(false);
  }

  return <div className="app-content"><header className="app-page-head"><div><span>Campaign operations</span><h1>Campaigns</h1><p>The source of truth for campaign list, status, detail, notes, tracking, and next action.</p></div><button className="button button-dark" type="button" onClick={() => setCreating(true)}><Plus weight="bold" /> New campaign</button></header><div className="campaign-layout"><section><div className="page-tabs" role="tablist" aria-label="Campaign filters">{filters.map(item => <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><section className="surface table-wrap"><table className="data-table campaign-table"><thead><tr><th>Campaign</th><th>Status</th><th>Creators</th><th>Revenue</th><th>ROAS</th><th>End</th><th /></tr></thead><tbody>{visible.map(row => <tr key={row.name} className={selected.name === row.name ? "selected-row" : ""}><td><strong>{row.name}</strong><small>{row.objective} · owner: {row.owner}</small></td><td><span className={`status-pill ${row.status === "At risk" ? "warning" : row.status === "Draft" || row.status === "Completed" ? "neutral" : ""}`}>{row.status}</span></td><td>{row.creators}</td><td>{row.revenue}</td><td>{row.roas}</td><td>{row.end}</td><td><button type="button" className="table-action" onClick={() => setSelected(row)}><Eye /> Detail</button></td></tr>)}</tbody></table></section></section><aside className="surface campaign-detail-panel"><span className="section-kicker">Campaign detail</span><h2>{selected.name}</h2><p>{selected.note}</p><div className="campaign-detail-grid"><div><span>Status</span><strong>{selected.status}</strong></div><div><span>Objective</span><strong>{selected.objective}</strong></div><div><span>Owner</span><strong>{selected.owner}</strong></div><div><span>Tracking</span><strong>{selected.tracking}</strong></div></div><section><h3>Next action</h3><Link className="campaign-next-action actionable" href={primaryAction.href}><Sparkle weight="fill" /><span><strong>{selected.nextAction}</strong><small>{primaryAction.detail}</small></span><b>{primaryAction.label}<ArrowRight /></b></Link></section><section><h3>Launch from this campaign</h3><div className="campaign-launch-actions"><Link className="button button-dark" href={`/app/kol-window?campaign=${encodeURIComponent(selected.name)}&step=brief`}><UsersThree /> Launch KOL</Link><Link className="button button-outline" href={`/app/ads-window?campaign=${encodeURIComponent(selected.name)}`}><Megaphone /> Open Ads Manager</Link><Link className="button button-outline" href={`/app/reports?campaign=${encodeURIComponent(selected.name)}`}><ChartLineUp /> Reports</Link></div></section><section><h3>Timeline</h3>{[["Brief", selected.status === "Draft" ? "Draft" : "Saved"], ["Execution", selected.status === "Draft" ? "Not started" : selected.status === "At risk" ? "At risk" : "In progress"], ["Results", selected.status === "Completed" ? "Closed" : "Pending"]].map(([label, value]) => <div className="campaign-timeline-row" key={label}><CalendarCheck /><span><strong>{label}</strong><small>{value}</small></span></div>)}</section></aside></div>{creating && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setCreating(false)}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="campaign-dialog-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setCreating(false)}><X /></button><span className="section-kicker">New campaign</span><h2 id="campaign-dialog-title">Create a focused growth initiative</h2><p>Create the campaign shell first, then launch Ads or KOL workflows from the detail panel.</p><form action={createCampaign} className="dialog-form"><label className="field"><span>Campaign name</span><input name="name" required autoFocus placeholder="e.g. Holiday Family Table" /></label><label className="field"><span>Objective</span><select name="objective" defaultValue="Sales / Order"><option>Awareness</option><option>Traffic</option><option>Engagement</option><option>Leads</option><option>Sales / Order</option></select></label><label className="field"><span>End date</span><input name="end" required placeholder="e.g. 18 Dec 2026" /></label><label className="field"><span>Internal note</span><textarea name="note" placeholder="Context, constraint, or what this campaign should prove." /></label><div className="dialog-actions"><button type="button" className="button button-outline" onClick={() => setCreating(false)}>Cancel</button><button type="submit" className="button button-dark">Create draft</button></div></form></section></div>}</div>;
}
