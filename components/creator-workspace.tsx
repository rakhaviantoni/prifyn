"use client";

import { useState } from "react";
import { Plus, SealCheck, X } from "@phosphor-icons/react";

type Creator = { name: string; handle: string; channels: string; fit: string; roas: string; verification: "Verified" | "Review" | "Unverified"; shortlisted: boolean };
type Filter = "All creators" | "Verified" | "Shortlisted" | "Needs review";

const initialCreators: Creator[] = [
  { name: "Nabila Putri", handle: "@nabilaeats", channels: "TikTok · Instagram", fit: "87%", roas: "2.8×", verification: "Verified", shortlisted: true },
  { name: "Ardian Prakoso", handle: "@ardianfamily", channels: "Instagram · YouTube", fit: "81%", roas: "3.1×", verification: "Verified", shortlisted: false },
  { name: "Dimas Wibowo", handle: "@dimastries", channels: "TikTok", fit: "76%", roas: "2.2×", verification: "Review", shortlisted: true },
  { name: "Sarah Amalia", handle: "@sarahcooks", channels: "TikTok · Instagram", fit: "74%", roas: "—", verification: "Unverified", shortlisted: false },
];

const filters: Filter[] = ["All creators", "Verified", "Shortlisted", "Needs review"];

export function CreatorWorkspace() {
  const [creators, setCreators] = useState(initialCreators);
  const [filter, setFilter] = useState<Filter>("All creators");
  const [creating, setCreating] = useState(false);
  const visible = creators.filter(item => filter === "All creators" || (filter === "Verified" ? item.verification === "Verified" : filter === "Shortlisted" ? item.shortlisted : item.verification !== "Verified"));

  function createCreator(form: FormData) {
    const name = String(form.get("name") || "").trim();
    const handle = String(form.get("handle") || "").trim();
    if (!name || !handle) return;
    setCreators(current => [{ name, handle, channels: "Not connected", fit: "Pending", roas: "—", verification: "Review", shortlisted: false }, ...current]);
    setFilter("All creators");
    setCreating(false);
  }

  return <div className="app-content"><header className="app-page-head"><div><span>Creator intelligence</span><h1>Creators</h1><p>Understand fit, evidence, history, and risk before you invite.</p></div><button className="button button-dark" type="button" onClick={() => setCreating(true)}><Plus weight="bold" /> Add creator</button></header><div className="page-tabs" role="tablist" aria-label="Creator filters">{filters.map(item => <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><section className="surface table-wrap"><table className="data-table"><thead><tr><th>Creator</th><th>Channels</th><th>Campaign fit</th><th>Historical ROAS</th><th>Verification</th></tr></thead><tbody>{visible.map(row => <tr key={row.handle}><td><strong>{row.name}</strong><small>{row.handle}</small></td><td>{row.channels}</td><td><strong>{row.fit}</strong><small>For Ramadan Made Simple</small></td><td>{row.roas}</td><td><span className={`status-pill ${row.verification !== "Verified" ? "neutral" : ""}`}>{row.verification === "Verified" && <SealCheck weight="fill" />} {row.verification}</span></td></tr>)}</tbody></table></section>{creating && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setCreating(false)}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="creator-dialog-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setCreating(false)}><X /></button><span className="section-kicker">Creator profile</span><h2 id="creator-dialog-title">Add a creator for review</h2><p>Add their identity first. Social connections, verification, and match evidence can follow.</p><form action={createCreator} className="dialog-form"><label className="field"><span>Creator name</span><input name="name" required autoFocus placeholder="e.g. Alya Pratama" /></label><label className="field"><span>Primary handle</span><input name="handle" required placeholder="e.g. @alyacooks" /></label><div className="dialog-actions"><button type="button" className="button button-outline" onClick={() => setCreating(false)}>Cancel</button><button type="submit" className="button button-dark">Add for review</button></div></form></section></div>}</div>;
}
