"use client";

import { useMemo, useState } from "react";
import type * as React from "react";
import {
  ArrowRight, CalendarCheck, CheckCircle, ClipboardText, FileArrowUp,
  LinkSimple, PaperPlaneTilt, PencilSimple, ShieldCheck, VideoCamera, X,
} from "@phosphor-icons/react";
import { getCreatorBrief } from "@/lib/creator-campaign-data";

type Dialog = "brief" | "upload" | "revision" | "proof" | null;

export default function CreatorCampaignsPage() {
  const brief = getCreatorBrief("ramadan-made-simple");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [draftStatus, setDraftStatus] = useState("First cut due");
  const [revisionStatus, setRevisionStatus] = useState("No active revision");
  const [proofStatus, setProofStatus] = useState("Waiting publish");
  const [notice, setNotice] = useState<string | null>(null);
  const submitted = draftStatus.includes("submitted") || draftStatus.includes("approved");

  const timeline = useMemo(() => [
    { icon: CheckCircle, title: "Brief accepted", copy: `${brief.approvedVersion} · agreement accepted`, done: true },
    { icon: VideoCamera, title: "First cut", copy: draftStatus, active: !submitted },
    { icon: PencilSimple, title: "Brand review / revision", copy: revisionStatus, active: submitted && !revisionStatus.includes("Resolved") },
    { icon: CalendarCheck, title: "Publish and proof", copy: proofStatus, active: revisionStatus.includes("Resolved") },
  ], [brief.approvedVersion, draftStatus, proofStatus, revisionStatus, submitted]);

  function notify(value: string) {
    setNotice(value);
    window.setTimeout(() => setNotice(null), 2600);
  }

  function submitUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDraftStatus("Draft v1 submitted · waiting brand review");
    setRevisionStatus("Brand review expected within 2 business days");
    setDialog(null);
    notify("Draft submitted to the brand workroom.");
  }

  function submitRevision(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRevisionStatus("Resolved · revised cut sent to brand");
    setProofStatus("Publish window remains 20 Aug · 18:00 WIB");
    setDialog(null);
    notify("Revision response sent with notes.");
  }

  function submitProof(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProofStatus("Proof submitted · waiting final approval");
    setDialog(null);
    notify("Proof submitted. Payment milestone is now waiting final brand approval.");
  }

  return <div className="app-content"><header className="app-page-head"><div><span>Active collaboration</span><h1>Campaign workrooms</h1><p>Briefs, submissions, revisions, approvals, schedules, tracking, and payments in one brand-connected timeline.</p></div></header><section className="surface workroom-hero"><div><span className="status-pill">{brief.status}</span><h2>{brief.title}</h2><p>{brief.brand} · {brief.deliverables.map(item => item.title).join(" + ")} · publish {brief.campaignWindow}</p></div><div className="workroom-hero-actions"><button className="button button-outline" type="button" onClick={() => setDialog("brief")}><ClipboardText /> View full brief</button><button className="button button-dark" type="button" onClick={() => setDialog("upload")}><FileArrowUp /> Upload first cut</button></div></section><section className="workroom-grid"><section className="surface workroom-timeline"><div className="surface-head"><h2>Collaboration timeline</h2><span>{submitted ? "Draft submitted" : "1 task needs action"}</span></div>{timeline.map(({ icon: StepIcon, title, copy, done, active }) => <article className={active ? "active" : ""} key={title}><StepIcon weight={done ? "fill" : "regular"} /><span><strong>{title}</strong><small>{copy}</small></span>{title === "First cut" && <button type="button" onClick={() => setDialog("upload")}>Open task <ArrowRight /></button>}{title.includes("revision") && submitted && <button type="button" onClick={() => setDialog("revision")}>Respond <ArrowRight /></button>}{title.includes("Publish") && <button type="button" onClick={() => setDialog("proof")}>Submit proof <ArrowRight /></button>}</article>)}</section><aside className="surface brief-summary"><span>{brief.approvedVersion}</span><h2>Make weekday meals feel possible.</h2><p>{brief.detailBrief}</p><dl><div><dt>Revisions</dt><dd>{brief.revisionLimit}</dd></div><div><dt>Usage rights</dt><dd>{brief.usageRights.split(".")[0]}</dd></div><div><dt>Creator fee</dt><dd>{brief.creatorFee}</dd></div><div><dt>Tracking</dt><dd>{brief.tracking.coupon}</dd></div></dl><button className="button button-outline" type="button" onClick={() => setDialog("brief")}>View full brief</button></aside></section><section className="workroom-grid connected"><section className="surface brief-summary wide"><span>Deliverables from brand</span><h2>What you need to deliver</h2><div className="creator-deliverable-list">{brief.deliverables.map(item => <article key={item.title}><VideoCamera weight="duotone" /><div><strong>{item.title}</strong><small>{item.detail}</small></div><span>{item.due}</span><b>{item.status}</b></article>)}</div></section><aside className="surface creator-tracking-card"><div><LinkSimple weight="duotone" /><div><span>Tracking</span><h2>Use the assigned link and coupon.</h2><p>Brand reporting will combine your link, coupon, proof screenshots, and imported platform metrics.</p></div></div><div><span>{brief.tracking.link}</span><strong>{brief.tracking.coupon}</strong></div></aside></section>{dialog === "brief" && <FullBriefDialog brief={brief} onClose={() => setDialog(null)} />}{dialog === "upload" && <TaskDialog title="Upload first cut" kicker="Submission" onClose={() => setDialog(null)} onSubmit={submitUpload} submitLabel="Submit draft"><label className="field"><span>Deliverable</span><select>{brief.deliverables.map(item => <option key={item.title}>{item.title}</option>)}</select></label><label className="field"><span>Draft URL</span><input type="url" required defaultValue="https://drive.google.com/file/draft-v1" /></label><label className="field"><span>Notes for brand</span><textarea required defaultValue="Opening hook and product result are included. Please review CTA clarity before I prepare final cut." /></label></TaskDialog>}{dialog === "revision" && <TaskDialog title="Respond to revision" kicker="Revision request" onClose={() => setDialog(null)} onSubmit={submitRevision} submitLabel="Send revised cut"><label className="field"><span>Revision source</span><select defaultValue="CTA clarity"><option>CTA clarity</option><option>Product scene</option><option>Caption</option></select></label><label className="field"><span>Revised URL</span><input type="url" required defaultValue="https://drive.google.com/file/draft-v2" /></label><label className="field"><span>What changed?</span><textarea required defaultValue="Made product result clearer before second 5, removed competitor mention, and added the assigned CTA in caption." /></label></TaskDialog>}{dialog === "proof" && <TaskDialog title="Submit publish proof" kicker="Post-campaign proof" onClose={() => setDialog(null)} onSubmit={submitProof} submitLabel="Submit proof"><label className="field"><span>Published URL</span><input type="url" required defaultValue="https://tiktok.com/@nabilaeats/video/ramadan" /></label><label className="field"><span>Proof checklist</span><textarea required defaultValue={brief.tracking.requiredProof.join("\n")} /></label><label className="field"><span>72h performance snapshot</span><input defaultValue="Views 184K · Clicks 8.120 · Coupon orders pending import" /></label></TaskDialog>}{notice && <div className="toast"><CheckCircle weight="fill" />{notice}</div>}</div>;
}

function FullBriefDialog({ brief, onClose }: { brief: ReturnType<typeof getCreatorBrief>; onClose: () => void }) {
  return <div className="dialog-backdrop" onMouseDown={onClose}><section className="dialog-card creator-brief-dialog" role="dialog" aria-modal="true" aria-labelledby="full-brief-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={onClose}><X /></button><span className="section-kicker">Full brand brief · read-only</span><h2 id="full-brief-title">{brief.title}</h2><div className="brief-dialog-grid"><section><p>{brief.detailBrief}</p><div className="brief-section"><h3>Content requirements</h3><ul>{brief.contentRequirements.map(item => <li key={item}>{item}</li>)}</ul></div><div className="brief-section split"><div><h3>Do</h3><ul>{brief.doList.map(item => <li key={item}>{item}</li>)}</ul></div><div><h3>Do not</h3><ul>{brief.dontList.map(item => <li key={item}>{item}</li>)}</ul></div></div><div className="brief-section"><h3>Proof required</h3><ul>{brief.tracking.requiredProof.map(item => <li key={item}>{item}</li>)}</ul></div></section><aside><div className="brief-mini-list"><h3>Commercials</h3><p><strong>{brief.creatorFee}</strong><br />{brief.paymentMilestones.map(item => `${item.label}: ${item.amount} (${item.status})`).join("\n")}</p><h3>Usage rights</h3><p>{brief.usageRights}</p><h3>Contact</h3><p>{brief.brandContact.name} · {brief.brandContact.role}<br />{brief.brandContact.responseTime}</p></div><button type="button" className="button button-dark" onClick={onClose}><ShieldCheck /> I understand</button></aside></div></section></div>;
}

function TaskDialog({ title, kicker, children, submitLabel, onClose, onSubmit }: { title: string; kicker: string; children: React.ReactNode; submitLabel: string; onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <div className="dialog-backdrop" onMouseDown={onClose}><section className="dialog-card revision-dialog" role="dialog" aria-modal="true" aria-labelledby={`${title}-title`} onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={onClose}><X /></button><span className="section-kicker">{kicker}</span><h2 id={`${title}-title`}>{title}</h2><form className="dialog-form" onSubmit={onSubmit}>{children}<div className="dialog-actions"><button className="button button-outline" type="button" onClick={onClose}>Cancel</button><button className="button button-dark" type="submit"><PaperPlaneTilt /> {submitLabel}</button></div></form></section></div>;
}
