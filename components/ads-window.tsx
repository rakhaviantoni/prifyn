"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, ChartBar, Check, CheckCircle, CloudArrowUp, LinkSimple, LockSimple, Play, Target } from "@phosphor-icons/react";

type Stage = "input" | "execution" | "post";
const platforms = ["Meta", "Google", "TikTok", "Tokopedia", "Shopee"];
const reportTypes = ["Performance", "Audience", "Location", "Creative", "User journey"];

export function AdsWindow() {
  const [stage, setStage] = useState<Stage>("input");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["Meta", "Google", "TikTok"]);
  const [connected, setConnected] = useState(["Meta"]);
  const [saved, setSaved] = useState(false);
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState("Performance");

  function togglePlatform(platform: string) {
    setSelectedPlatforms(current => current.includes(platform) ? current.filter(item => item !== platform) : [...current, platform]);
  }
  function saveInput(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
    setStage("execution");
  }

  return <div className="app-content workflow-page">
    <header className="app-page-head"><div><span>Paid media workspace</span><h1>Ads Manager</h1><p>Create, launch, and optimize campaigns across every paid channel.</p></div><span className={`workflow-health ${running ? "live" : ""}`}><i />{running ? "Campaign running" : saved ? "Ready to connect" : "Draft"}</span></header>
    <WorkflowSteps active={stage} saved={saved} running={running} onChange={setStage} />

    {stage === "input" && <form onSubmit={saveInput} className="workflow-grid">
      <section className="surface workflow-card"><div className="workflow-card-head"><span><Target weight="duotone" /></span><div><small>01 · Campaign details</small><h2>Set your campaign goal</h2></div></div><div className="workflow-form-grid">
        <label className="field"><span>Campaign objective</span><select required defaultValue="Sales / Order"><option>Awareness</option><option>Traffic</option><option>Engagement</option><option>Leads</option><option>Sales / Order</option></select></label>
        <label className="field"><span>Campaign name</span><input required defaultValue="Ramadan Made Simple" /></label>
        <label className="field"><span>Conversion event</span><select required defaultValue="Purchase"><option>Purchase</option><option>Lead form submit</option><option>Add to cart</option><option>Landing page view</option></select></label>
        <label className="field"><span>Budget</span><input required type="number" defaultValue="28000000" /></label>
        <label className="field"><span>Start date</span><input required type="date" defaultValue="2026-08-10" /></label>
        <label className="field"><span>End date</span><input required type="date" defaultValue="2026-08-30" /></label>
        <label className="field field-wide"><span>Audience</span><textarea required defaultValue="Indonesia · 24–44 · Food, family dining, home cooking · Existing customer lookalike" /></label>
        <fieldset className="field field-wide platform-picker"><legend>Ad channels</legend>{platforms.map(platform => <label key={platform} className={selectedPlatforms.includes(platform) ? "selected" : ""}><input type="checkbox" checked={selectedPlatforms.includes(platform)} onChange={() => togglePlatform(platform)} /><span>{platform}</span></label>)}</fieldset>
      </div></section>
      <section className="surface workflow-card"><div className="workflow-card-head"><span><CloudArrowUp weight="duotone" /></span><div><small>02 · Ad creative</small><h2>Add your campaign content</h2></div></div><div className="workflow-form-grid">
        <label className="field"><span>Ad name</span><input required defaultValue="Family Table · Video A" /></label>
        <label className="field"><span>Brand profile</span><input required defaultValue="Nusa Spice Indonesia" /></label>
        <label className="field field-wide upload-field"><span>Image or video <em>Optional in preview</em></span><input type="file" accept="image/*,video/*" /><small>Upload is optional in this preview. Connected accounts will validate channel requirements before launch.</small></label>
        <label className="field field-wide"><span>Ad copy and keywords</span><textarea required defaultValue="Buka puasa terasa lebih dekat bersama Nusa Spice. #RamadanMadeSimple #MasakBersama" /></label>
        <label className="field"><span>Destination URL</span><input required type="url" defaultValue="https://example.com/ramadan" /></label>
        <label className="field"><span>Conversion tracking</span><select defaultValue="UTM + pixel"><option>UTM + pixel</option><option>UTM only</option><option>Server-side conversion</option></select></label>
      </div><button className="button button-dark workflow-submit" type="submit">Save campaign setup <ArrowRight /></button></section>
    </form>}

    {stage === "execution" && <div className="workflow-stack"><section className="surface workflow-card"><div className="workflow-card-head"><span><LinkSimple weight="duotone" /></span><div><small>Channel connections</small><h2>Connect the campaign input</h2><p>PRIFYN creates paused drafts first. Nothing runs until you confirm.</p></div></div><div className="connection-grid">{platforms.map(platform => { const selected = selectedPlatforms.includes(platform); const isConnected = connected.includes(platform); const fallback = platform === "Tokopedia" || platform === "Shopee"; return <article key={platform} className={!selected ? "disabled" : ""}><div><strong>{platform}</strong><span>{!selected ? "Not selected" : isConnected ? "Account connected" : fallback ? "Manual / CSV bridge" : "Connection required"}</span></div>{selected && <button type="button" className={`button ${isConnected ? "button-outline" : "button-dark"}`} onClick={() => setConnected(current => isConnected ? current.filter(item => item !== platform) : [...current, platform])}>{isConnected ? <><CheckCircle weight="fill" /> Connected</> : fallback ? "Use fallback" : "Connect"}</button>}</article>; })}</div></section><section className="surface launch-card"><div><span className="section-kicker">Pre-flight</span><h2>{running ? "Campaign is live across connected channels." : "Review once. Launch everywhere."}</h2><p>{connected.length} channel{connected.length === 1 ? "" : "s"} ready · Creative checks passed · Tracking configured</p></div><button type="button" className="button button-dark button-large" disabled={connected.length === 0} onClick={() => { setRunning(true); setStage("post"); }}><Play weight="fill" /> {running ? "View results" : "Run campaign"}</button></section></div>}

    {stage === "post" && <div className="workflow-stack"><section className="surface report-overview"><div className="report-score"><span>Overall ROAS</span><strong>3.42×</strong><small>↑ 0.31× vs previous period</small></div><div className="metric-grid"><Metric label="Reach" value="1.84m" /><Metric label="Impressions" value="3.21m" /><Metric label="Clicks" value="91.2k" /><Metric label="CTR" value="2.84%" /></div><div className="metric-grid"><Metric label="Engagement" value="128k" /><Metric label="Leads / orders" value="4,816" /><Metric label="Conversion rate" value="5.28%" /><Metric label="Attributed revenue" value="Rp 86.4m" /></div></section><section className="surface workflow-card"><div className="workflow-card-head"><span><ChartBar weight="duotone" /></span><div><small>Campaign results</small><h2>{report} report</h2></div></div><div className="page-tabs" role="tablist" aria-label="Ads reports">{reportTypes.map(item => <button type="button" role="tab" aria-selected={report === item} className={report === item ? "active" : ""} onClick={() => setReport(item)} key={item}>{item}</button>)}</div><div className="report-bars">{[["Meta",82],["TikTok",68],["Google",54],["Tokopedia",31],["Shopee",24]].map(([label,value]) => <div key={label}><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{report === "Performance" ? `${Number(value) / 20 + 1.2}×` : `${value}%`}</strong></div>)}</div><div className="evidence-strip"><CheckCircle weight="fill" /><span><strong>Recommended next step:</strong> keep creator-led Meta placements and reduce broad Google spend by 15%.</span><small>High confidence · refreshed 12 min ago</small></div></section></div>}
  </div>;
}

function WorkflowSteps({ active, saved, running, onChange }: { active: Stage; saved: boolean; running: boolean; onChange: (stage: Stage) => void }) {
  const steps = [["input", "Setup", "Goal, audience, creative"], ["execution", "Launch", "Connect channels and go live"], ["post", "Results", "Performance and ROAS"]] as const;
  return <nav className="workflow-steps" aria-label="Ads campaign stages">{steps.map(([key, title, detail], index) => { const locked = key === "execution" ? !saved : key === "post" ? !running : false; const done = key === "input" ? saved : key === "execution" ? running : false; return <button key={key} type="button" disabled={locked} aria-current={active === key ? "step" : undefined} className={`${active === key ? "active" : ""} ${done ? "done" : ""}`} title={locked ? key === "execution" ? "Save campaign setup first" : "Run the campaign first" : undefined} onClick={() => onChange(key)}><b>{locked ? <LockSimple /> : done ? <Check /> : index + 1}</b><span><strong>{title}</strong><small>{locked ? key === "execution" ? "Complete setup first" : "Go live to unlock" : detail}</small></span></button>; })}</nav>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="metric-box"><span>{label}</span><strong>{value}</strong></div>; }
