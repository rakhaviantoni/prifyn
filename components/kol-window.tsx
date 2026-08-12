"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowRight, CalendarCheck, Check, CheckCircle, Clock, CopySimple, FilmSlate,
  LinkSimple, LockSimple, MagnifyingGlass, Package, PencilSimple, Star, UsersThree, X,
} from "@phosphor-icons/react";
import { CreatorLivePerformance } from "@/components/metrics/live-metrics";
import { WorkspaceLink } from "@/components/workspace-link";

type Stage = "input" | "execution" | "post";
type BudgetType = "Cash budget" | "Product barter" | "Cash + product";
type CampaignMode = "existing" | "manual";
type RevisionStatus = "Submitted" | "Revision requested" | "Approved" | "Scheduled";
type KolCandidate = { name: string; handle: string; level: string; platform: string; rate: string; fit?: number };

const levels = ["Mega", "Macro", "Micro", "Nano", "Buzzer Package"];
const platforms = ["TikTok", "Instagram", "Facebook", "YouTube", "LinkedIn", "Tokopedia", "Shopee"];
const deliverables = ["TikTok video", "Instagram Reel", "Instagram Story", "Facebook post", "YouTube Short", "Shopee affiliate video", "Tokopedia product post", "Other / custom"];

export function KolWindow({ initialCampaign, initialStep, campaignOptions: workspaceCampaigns = [] }: { initialCampaign?: string; initialStep?: string; campaignOptions?: string[] }) {
  const cleanInitialCampaign = initialCampaign?.trim();
  const campaignOptions = useMemo(() => {
    const options = workspaceCampaigns.length ? workspaceCampaigns : [];
    if (cleanInitialCampaign && !options.includes(cleanInitialCampaign)) return [cleanInitialCampaign, ...options];
    return options;
  }, [cleanInitialCampaign, workspaceCampaigns]);
  const [stage, setStage] = useState<Stage>(initialStep === "collaboration" ? "execution" : "input");
  const [campaignMode, setCampaignMode] = useState<CampaignMode>(cleanInitialCampaign || campaignOptions.length ? "existing" : "manual");
  const [selectedCampaign, setSelectedCampaign] = useState(cleanInitialCampaign || campaignOptions[0] || "");
  const [manualCampaign, setManualCampaign] = useState("");
  const [selectedLevels, setSelectedLevels] = useState(["Micro", "Nano"]);
  const [budgetType, setBudgetType] = useState<BudgetType>("Cash budget");
  const [buzzerCount, setBuzzerCount] = useState(5);
  const [buzzerUnitPrice, setBuzzerUnitPrice] = useState(200000);
  const [selectedDeliverables, setSelectedDeliverables] = useState(["TikTok video", "Instagram Story"]);
  const [customDeliverable, setCustomDeliverable] = useState("");
  const [candidates, setCandidates] = useState<KolCandidate[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<RevisionStatus>("Submitted");
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [creatorDialogOpen, setCreatorDialogOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const campaignName = campaignMode === "existing" ? selectedCampaign : manualCampaign || "Untitled campaign";
  const buzzerSelected = selectedLevels.includes("Buzzer Package");
  const selectedCreators = useMemo(() => candidates.filter(candidate => selected.includes(candidate.name)), [candidates, selected]);
  const applicantsReady = candidates.length > 0;

  function notify(value: string) {
    setNotice(value);
    window.setTimeout(() => setNotice(null), 2400);
  }

  function saveBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
    setStage("execution");
  }

  function toggleCreator(name: string) {
    setSelected(current => current.includes(name) ? current.filter(item => item !== name) : [...current, name]);
  }

  function toggleLevel(level: string) {
    setSelectedLevels(current => current.includes(level) ? current.filter(item => item !== level) : [...current, level]);
  }

  function toggleDeliverable(item: string) {
    setSelectedDeliverables(current => current.includes(item) ? current.filter(value => value !== item) : [...current, item]);
  }

  const deliverableSummary = selectedDeliverables.map(item => item === "Other / custom" && customDeliverable.trim() ? customDeliverable.trim() : item).join(" · ");

  function submitRevision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionStatus("Revision requested");
    setRevisionOpen(false);
    notify("Revision request saved.");
  }

  function addCreator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;
    const creator: KolCandidate = {
      name,
      handle: String(form.get("handle") ?? "").trim() || "@creator",
      level: String(form.get("level") ?? "Micro"),
      platform: String(form.get("platform") ?? "TikTok"),
      rate: String(form.get("rate") ?? "").trim() || "Rate not set",
    };
    setCandidates(current => current.some(item => item.name.toLowerCase() === creator.name.toLowerCase()) ? current : [...current, creator]);
    setSelected(current => current.includes(creator.name) ? current : [...current, creator.name]);
    setCreatorDialogOpen(false);
    notify(`${creator.name} added to this KOL campaign.`);
  }

  async function copyTrackingTemplate() {
    const template = `Campaign: ${campaignName}\nCreator: [creator_name]\nAffiliate/coupon: [code]\nDestination URL: [utm_or_affiliate_link]\nProof URL: [post_or_screenshot]\nOrders/revenue: [import report or manual proof]`;
    try { await navigator.clipboard.writeText(template); notify("Tracking template copied."); }
    catch { notify("Tracking template ready. Copy failed in this browser."); }
  }

  return <div className="app-content workflow-page"><header className="app-page-head"><div><span>KOL campaign workspace</span><h1>Launch Campaign</h1><p>{cleanInitialCampaign ? `Campaign context loaded from ${cleanInitialCampaign}. Complete the brief, recruit creators, then track submissions and results here.` : "Start from an existing campaign or create a focused KOL brief for creator recruitment, collaboration, and results."}</p></div><span className={`workflow-health ${submissionStatus === "Scheduled" ? "live" : ""}`}><i />{submissionStatus === "Scheduled" ? "Publish scheduled" : saved ? applicantsReady ? `${selected.length} creator selected` : "Saved brief" : "Draft brief"}</span></header><KolSteps active={stage} saved={saved} scheduled={submissionStatus === "Scheduled"} onChange={setStage} />

    {stage === "input" && <form onSubmit={saveBrief} className="workflow-grid kol-input-grid"><section className="surface workflow-card"><div className="workflow-card-head"><span><UsersThree weight="duotone" /></span><div><small>Campaign brief</small><h2>Shape the creator brief</h2><p>Choose an existing campaign when this KOL work supports a broader growth initiative, or create a manual draft.</p></div></div><div className="workflow-form-grid"><fieldset className="field field-wide compensation-picker"><legend>Campaign source</legend>{(["existing", "manual"] as CampaignMode[]).map(item => <label key={item} className={campaignMode === item ? "selected" : ""}><input type="radio" name="campaignMode" checked={campaignMode === item} disabled={item === "existing" && !campaignOptions.length} onChange={() => setCampaignMode(item)} /><span>{item === "existing" ? "Select existing campaign" : "Create campaign name"}</span></label>)}</fieldset>{campaignMode === "existing" && campaignOptions.length ? <label className="field"><span>Campaign name</span><select value={selectedCampaign} onChange={event => setSelectedCampaign(event.target.value)}>{campaignOptions.map(item => <option key={item}>{item}</option>)}</select></label> : <label className="field"><span>Campaign name</span><input required value={manualCampaign} onChange={event => setManualCampaign(event.target.value)} placeholder="e.g. Eid Hampers Push" /></label>}<label className="field"><span>Campaign objective</span><select defaultValue="Sales / Order"><option>Awareness</option><option>Traffic</option><option>Engagement</option><option>Leads</option><option>Sales / Order</option></select></label><label className="field field-wide"><span>Team note</span><textarea defaultValue={campaignOptions.length ? "This KOL activity is connected to an existing campaign, so brief, creator decisions, submissions, and results stay under the same campaign context." : "No campaign exists yet. Save this as a manual KOL campaign or import/create a campaign first."} /></label><fieldset className="field field-wide platform-picker"><legend>Creator level</legend>{levels.map(level => <label key={level} className={selectedLevels.includes(level) ? "selected" : ""}><input type="checkbox" checked={selectedLevels.includes(level)} onChange={() => toggleLevel(level)} /><span>{level}</span></label>)}</fieldset>{buzzerSelected && <section className="field field-wide buzzer-package-card"><div><Package weight="duotone" /><span><strong>Buzzer package</strong><small>Flexible pricing for high-volume posting packages.</small></span></div><div className="buzzer-dynamic-grid"><label><span>Number of buzzers</span><input type="number" min={1} value={buzzerCount} onChange={event => setBuzzerCount(Number(event.target.value))} /></label><label><span>Price per buzzer</span><input type="number" min={0} step={50000} value={buzzerUnitPrice} onChange={event => setBuzzerUnitPrice(Number(event.target.value))} /></label><div><span>Estimated package</span><strong>Rp {(buzzerCount * buzzerUnitPrice).toLocaleString("id-ID")}</strong></div></div><p>Includes creator coordination and proof-of-posting. Content production, usage rights, and extra revisions stay separate.</p></section>}<label className="field field-wide"><span>Detail brief</span><textarea required placeholder="Explain product, audience, mandatory message, tone, proof requirements, usage rights, and where creators should publish." /></label><fieldset className="field field-wide platform-picker"><legend>Platforms</legend>{platforms.map(platform => <label key={platform}><input type="checkbox" defaultChecked={platform === "TikTok" || platform === "Instagram"} /><span>{platform}</span></label>)}</fieldset></div></section><section className="surface workflow-card"><div className="workflow-card-head"><span><Star weight="duotone" /></span><div><small>Success & collaboration</small><h2>Define the work, not just the budget</h2></div></div><div className="workflow-form-grid"><label className="field"><span>Primary KPI</span><select defaultValue="Conversions"><option>Views</option><option>Clicks</option><option>Conversions</option><option>Proof of posting</option></select></label><label className="field"><span>KPI target</span><input required type="number" placeholder="e.g. 1200" /></label><fieldset className="field field-wide platform-picker"><legend>Deliverables needed</legend>{deliverables.map(item => <label key={item} className={selectedDeliverables.includes(item) ? "selected" : ""}><input type="checkbox" checked={selectedDeliverables.includes(item)} onChange={() => toggleDeliverable(item)} /><span>{item}</span></label>)}</fieldset>{selectedDeliverables.includes("Other / custom") && <label className="field field-wide"><span>Custom deliverable</span><input value={customDeliverable} onChange={event => setCustomDeliverable(event.target.value)} placeholder="e.g. Live stream, carousel post, WhatsApp Status, Snapgram series" /></label>}<fieldset className="field field-wide compensation-picker"><legend>Compensation</legend>{(["Cash budget", "Product barter", "Cash + product"] as BudgetType[]).map(item => <label key={item} className={budgetType === item ? "selected" : ""}><input type="radio" name="budgetType" checked={budgetType === item} onChange={() => setBudgetType(item)} /><span>{item}</span></label>)}</fieldset>{budgetType !== "Product barter" && <label className="field"><span>Total cash budget</span><input required type="number" placeholder="e.g. 28000000" /></label>}{budgetType !== "Cash budget" && <label className="field field-wide"><span>Product / barter details</span><textarea required placeholder="Describe product package, delivery, content usage, and creator obligations." /></label>}<label className="field"><span>Maximum revisions</span><select defaultValue="3"><option>1</option><option>2</option><option>3</option></select></label><label className="field"><span>Start date</span><input required type="date" /></label><label className="field"><span>End date</span><input required type="date" /></label></div><div className="brief-note"><CheckCircle weight="fill" /><span>Save the brief first, select creators next, then track approvals, publish schedule, and results.</span></div><button className="button button-dark workflow-submit" type="submit">Save brief & start recruitment <ArrowRight /></button></section></form>}

    {stage === "execution" && <div className="workflow-stack"><section className="surface workflow-card"><div className="workflow-card-head"><span><MagnifyingGlass weight="duotone" /></span><div><small>Joined creators</small><h2>Review creators for {campaignName}</h2></div></div>{!applicantsReady ? <div className="kol-empty-state"><span><UsersThree weight="duotone" /></span><h3>No creators have joined yet.</h3><p>The list will be ready when creators join this campaign. Add a creator manually or open Creator Discovery to shortlist creators for this brief.</p><div><small>Campaign is accepting applications</small><button type="button" className="button button-dark" onClick={() => setCreatorDialogOpen(true)}>Add creator</button><WorkspaceLink className="button button-outline" href="/app/creators">Open Creator Discovery</WorkspaceLink></div></div> : <><div className="workflow-actions top-actions"><button type="button" className="button button-outline" onClick={() => setCreatorDialogOpen(true)}>Add creator</button><WorkspaceLink className="button button-outline" href="/app/creators">Open Creator Discovery</WorkspaceLink></div><div className="kol-candidates">{candidates.map(candidate => <article key={candidate.name} className={selected.includes(candidate.name) ? "selected" : ""}><div className="kol-avatar">{candidate.name.split(" ").map(part => part[0]).join("")}</div><div><strong>{candidate.name}</strong><span>{candidate.handle} · {candidate.level}</span><small>{candidate.platform}</small></div><div className="kol-fit"><b>{candidate.fit ? `${candidate.fit}%` : "Review"}</b><span>{candidate.fit ? "campaign fit" : "fit pending"}</span></div><div><strong>{candidate.rate}</strong><small>rate card · evidence needed</small></div><button type="button" className={`button ${selected.includes(candidate.name) ? "button-outline" : "button-dark"}`} onClick={() => toggleCreator(candidate.name)}>{selected.includes(candidate.name) ? "Selected" : "Select"}</button></article>)}</div></>}</section>{applicantsReady && selectedCreators.length > 0 && <section className="surface workflow-card"><div className="workflow-card-head"><span><FilmSlate weight="duotone" /></span><div><small>Submission workflow</small><h2>Review, revise, and approve</h2><p>Multiple selected creators stay visible so the team can review each submission without losing context.</p></div></div><div className="selected-submissions">{selectedCreators.map(creator => <article key={creator.name}><div><span className="kol-avatar">{creator.name.split(" ").map(part => part[0]).join("")}</span><div><strong>{creator.name}</strong><small>{deliverableSummary} · Waiting for upload or proof</small></div></div><span className={`status-pill ${submissionStatus === "Revision requested" ? "warning" : submissionStatus === "Approved" || submissionStatus === "Scheduled" ? "" : "neutral"}`}>{submissionStatus}</span><button type="button" className="button button-outline" onClick={() => setRevisionOpen(true)}>Review detail</button></article>)}</div><div className="submission-flow"><div><span>Submission</span><strong>{selectedCreators.length} selected creators</strong><small>{deliverableSummary}</small></div><ArrowRight /><div><span>Review status</span><strong>{submissionStatus}</strong><small>Revision cap: 3 rounds · notes required</small></div><ArrowRight /><div><span>Publish</span><strong>{submissionStatus === "Scheduled" ? "Scheduled after approval" : "Waiting for approval"}</strong><small>Manual confirmation available</small></div></div><div className="workflow-actions"><button type="button" className="button button-outline" disabled={submissionStatus === "Approved" || submissionStatus === "Scheduled"} onClick={() => setRevisionOpen(true)}><PencilSimple /> Request revision</button><button type="button" className="button button-dark" disabled={submissionStatus === "Scheduled"} onClick={() => setSubmissionStatus(submissionStatus === "Approved" ? "Scheduled" : "Approved")}><CalendarCheck />{submissionStatus === "Approved" ? "Schedule publish" : submissionStatus === "Scheduled" ? "Scheduled" : "Approve selected"}</button></div></section>}</div>}

    {stage === "post" && <div className="workflow-stack"><section className="surface tracking-summary"><div><LinkSimple weight="duotone" /><span><strong>Tracking can work before full API integrations.</strong><small>Use affiliate links, tracked destination URLs, coupon codes, creator-provided proof, and manual order imports until platform APIs are connected.</small></span></div><button type="button" className="button button-outline" onClick={copyTrackingTemplate}><CopySimple /> Copy tracking template</button></section><CreatorLivePerformance /><section className="surface table-wrap"><div className="surface-head"><h2>KOL performance report</h2><span className="status-pill neutral"><Clock /> Waiting for evidence</span></div><table className="data-table"><thead><tr><th>KOL</th><th>Tracking source</th><th>Views</th><th>Clicks</th><th>Orders</th><th>ROAS</th></tr></thead><tbody>{selectedCreators.length ? selectedCreators.map(creator => <tr key={creator.name}><td><strong>{creator.name}</strong><small>{creator.handle}</small></td><td>Link, coupon, proof, or import needed</td><td>Waiting</td><td>Waiting</td><td>Waiting</td><td><strong>Not ready</strong></td></tr>) : <tr><td colSpan={6}><strong>No selected creators yet.</strong><small>Save the brief, add creators, approve/schedule publish, then import proof or outcome data.</small></td></tr>}</tbody></table></section><div className="evidence-strip"><CheckCircle weight="fill" /><span><strong>Next action:</strong> import affiliate/coupon results, creator proof, or order data before PRIFYN calculates KOL ROAS or recommends rebooking.</span><small>Recommendations unlock after evidence exists</small></div></div>}
    {revisionOpen && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setRevisionOpen(false)}><section className="dialog-card revision-dialog" role="dialog" aria-modal="true" aria-labelledby="revision-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setRevisionOpen(false)}><X /></button><span className="section-kicker">Revision detail</span><h2 id="revision-title">Request a specific revision</h2><p>Revision requests should be actionable enough for creators to fix without guessing.</p><form className="dialog-form" onSubmit={submitRevision}><label className="field"><span>Creator</span><select>{selectedCreators.map(creator => <option key={creator.name}>{creator.name}</option>)}</select></label><label className="field"><span>Revision type</span><select defaultValue="CTA"><option>CTA</option><option>Product scene</option><option>Caption</option><option>Brand safety</option><option>Technical quality</option></select></label><label className="field"><span>Requested changes</span><textarea required defaultValue="Keep the opening hook, but make the product result clearer before second 5. Add the campaign CTA in the caption and remove the competitor mention." /></label><label className="field"><span>Deadline</span><input type="datetime-local" defaultValue="2026-08-12T17:00" /></label><div className="dialog-actions"><button type="button" className="button button-outline" onClick={() => setRevisionOpen(false)}>Cancel</button><button className="button button-dark" type="submit">Send revision request</button></div></form></section></div>}
    {creatorDialogOpen && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setCreatorDialogOpen(false)}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="add-kol-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setCreatorDialogOpen(false)}><X /></button><span className="section-kicker">Add creator</span><h2 id="add-kol-title">Add creator to {campaignName}</h2><p>Add a creator you found manually, from an agency list, or from Creator Discovery.</p><form className="dialog-form" onSubmit={addCreator}><label className="field"><span>Creator name</span><input name="name" required placeholder="e.g. Creator / KOL name" /></label><label className="field"><span>Username</span><input name="handle" placeholder="@username" /></label><label className="field"><span>Creator level</span><select name="level" defaultValue="Micro">{levels.map(level => <option key={level}>{level}</option>)}</select></label><label className="field"><span>Main platform</span><select name="platform" defaultValue="TikTok">{platforms.map(platform => <option key={platform}>{platform}</option>)}</select></label><label className="field"><span>Rate card</span><input name="rate" placeholder="e.g. Rp 4.000.000 or barter" /></label><div className="dialog-actions"><button type="button" className="button button-outline" onClick={() => setCreatorDialogOpen(false)}>Cancel</button><button className="button button-dark" type="submit">Add & select creator</button></div></form></section></div>}
    {notice && <div className="toast" role="status"><CheckCircle weight="fill" />{notice}</div>}
  </div>;
}

function KolSteps({ active, saved, scheduled, onChange }: { active: Stage; saved: boolean; scheduled: boolean; onChange: (stage: Stage) => void }) {
  const steps = [["input", "Brief", "Save draft"], ["execution", "Collaboration", "Save selected creators"], ["post", "Results", "Link, coupon, proof, ROAS"]] as const;
  return <nav className="workflow-steps" aria-label="KOL campaign stages">{steps.map(([key, title, detail], index) => { const locked = key === "execution" ? !saved : key === "post" ? !scheduled : false; const done = key === "input" ? saved : key === "execution" ? scheduled : false; return <button key={key} type="button" disabled={locked} aria-current={active === key ? "step" : undefined} className={`${active === key ? "active" : ""} ${done ? "done" : ""}`} onClick={() => onChange(key)}><b>{locked ? <LockSimple /> : done ? <Check /> : index + 1}</b><span><strong>{title}</strong><small>{locked ? "Complete the previous step" : detail}</small></span></button>; })}</nav>;
}
