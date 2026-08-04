"use client";

import { useState } from "react";
import { Plus, X } from "@phosphor-icons/react";

type Campaign = { name: string; status: "Active" | "At risk" | "Draft" | "Completed"; creators: string; revenue: string; roas: string; end: string };
type Filter = "All campaigns" | "Active" | "Needs attention" | "Completed";

const initialCampaigns: Campaign[] = [
  { name: "Ramadan Made Simple", status: "Active", creators: "8 creators", revenue: "Rp 28.4m", roas: "4.1×", end: "16 Aug 2026" },
  { name: "Weekend Family Feast", status: "At risk", creators: "5 creators", revenue: "Rp 12.8m", roas: "2.7×", end: "9 Aug 2026" },
  { name: "Lunch Box Launch", status: "Active", creators: "12 creators", revenue: "Rp 36.2m", roas: "3.2×", end: "28 Aug 2026" },
  { name: "Back to School", status: "Draft", creators: "0 creators", revenue: "Rp 18.0m", roas: "—", end: "3 Sep 2026" },
  { name: "Everyday Iftar", status: "Completed", creators: "7 creators", revenue: "Rp 31.6m", roas: "3.8×", end: "28 Mar 2026" },
];

const filters: Filter[] = ["All campaigns", "Active", "Needs attention", "Completed"];

export function CampaignWorkspace({ initialCreating = false }: { initialCreating?: boolean }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [filter, setFilter] = useState<Filter>("All campaigns");
  const [creating, setCreating] = useState(initialCreating);
  const visible = campaigns.filter(item => filter === "All campaigns" || (filter === "Needs attention" ? item.status === "At risk" || item.status === "Draft" : item.status === filter));

  function createCampaign(form: FormData) {
    const name = String(form.get("name") || "").trim();
    const end = String(form.get("end") || "").trim();
    if (!name || !end) return;
    setCampaigns(current => [{ name, status: "Draft", creators: "0 creators", revenue: "Rp 0", roas: "—", end }, ...current]);
    setFilter("All campaigns");
    setCreating(false);
  }

  return <div className="app-content"><header className="app-page-head"><div><span>Campaign operations</span><h1>Campaigns</h1><p>Plan, execute, and close the loop on every growth initiative.</p></div><button className="button button-dark" type="button" onClick={() => setCreating(true)}><Plus weight="bold" /> New campaign</button></header><div className="page-tabs" role="tablist" aria-label="Campaign filters">{filters.map(item => <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><section className="surface table-wrap"><table className="data-table"><thead><tr><th>Campaign</th><th>Status</th><th>Creators</th><th>Attributed revenue</th><th>ROAS</th><th>End date</th></tr></thead><tbody>{visible.map(row => <tr key={row.name}><td><strong>{row.name}</strong><small>Growth campaign</small></td><td><span className={`status-pill ${row.status === "At risk" ? "warning" : row.status === "Draft" || row.status === "Completed" ? "neutral" : ""}`}>{row.status}</span></td><td>{row.creators}</td><td>{row.revenue}</td><td>{row.roas}</td><td>{row.end}</td></tr>)}</tbody></table></section>{creating && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setCreating(false)}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="campaign-dialog-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setCreating(false)}><X /></button><span className="section-kicker">New campaign</span><h2 id="campaign-dialog-title">Create a focused growth initiative</h2><p>Start with the objective and finish date. The brief, creators, and evidence can follow.</p><form action={createCampaign} className="dialog-form"><label className="field"><span>Campaign name</span><input name="name" required autoFocus placeholder="e.g. Holiday Family Table" /></label><label className="field"><span>End date</span><input name="end" required placeholder="e.g. 18 Dec 2026" /></label><div className="dialog-actions"><button type="button" className="button button-outline" onClick={() => setCreating(false)}>Cancel</button><button type="submit" className="button button-dark">Create draft</button></div></form></section></div>}</div>;
}
