"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  Archive,
  ArrowRight,
  ChatCircleDots,
  CheckCircle,
  DotsThree,
  Eye,
  NotePencil,
  PaperPlaneTilt,
  Sparkle,
  UserPlus,
  X,
} from "@phosphor-icons/react";
import { creatorProfiles } from "@/lib/creator-intelligence-data";

const stages = ["Discovered", "Shortlisted", "Invited", "Applied", "Selected"] as const;
type Stage = typeof stages[number];
type Candidate = { id: string; profileId?: string; name: string; handle: string; initials: string; fit: number; rate: string; summary: string };
type Dialog = { type: "invite"; id?: string } | { type: "add"; stage: Stage } | { type: "message" | "note" | "review"; id: string } | null;

const seedPipeline: Record<Stage, string[]> = { Discovered: ["alya-pratama"], Shortlisted: ["dimas-wibowo", "sarah-amalia"], Invited: ["ardian-prakoso"], Applied: ["kevin-tan"], Selected: ["nabila-putri"] };
const seedCandidates = Object.fromEntries(creatorProfiles.map(creator => [creator.id, { id: creator.id, profileId: creator.id, name: creator.name, handle: creator.handle, initials: creator.initials, fit: creator.fit, rate: creator.rate, summary: `${creator.strengths[0]} · ${creator.platforms[0]}` }])) as Record<string, Candidate>;

export function TalentPipeline() {
  const [pipeline, setPipeline] = useState(seedPipeline);
  const [candidates, setCandidates] = useState(seedCandidates);
  const [notes, setNotes] = useState<Record<string, number>>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const total = stages.reduce((sum, stage) => sum + pipeline[stage].length, 0);
  const inviteable = useMemo(() => [...pipeline.Discovered, ...pipeline.Shortlisted].map(id => candidates[id]).filter(Boolean), [pipeline, candidates]);
  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2600); };

  function currentStage(id: string) { return stages.find(stage => pipeline[stage].includes(id)); }
  function move(id: string, target: Stage) {
    const source = currentStage(id);
    if (!source || source === target) return;
    setPipeline(current => ({ ...current, [source]: current[source].filter(item => item !== id), [target]: [...current[target], id] }));
    setActiveMenu(null);
    showNotice(`${candidates[id].name} moved to ${target}.`);
  }
  function archive(id: string) {
    const source = currentStage(id);
    if (!source) return;
    setPipeline(current => ({ ...current, [source]: current[source].filter(item => item !== id) }));
    setActiveMenu(null);
    showNotice(`${candidates[id].name} archived from this campaign. The profile remains in Creator Discovery.`);
  }
  function addCandidate(form: FormData) {
    if (dialog?.type !== "add") return;
    const name = String(form.get("name") || "").trim();
    const handle = String(form.get("handle") || "").trim();
    if (!name || !handle) return;
    const id = `manual-${Date.now()}`;
    const initials = name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
    setCandidates(current => ({ ...current, [id]: { id, name, handle, initials, fit: 0, rate: "Rate pending", summary: "Manual candidate · AI analysis pending" } }));
    setPipeline(current => ({ ...current, [dialog.stage]: [...current[dialog.stage], id] }));
    setDialog(null);
    showNotice(`${name} added to ${dialog.stage}.`);
  }
  function inviteCandidates(form: FormData) {
    const ids = form.getAll("candidate").map(String);
    if (!ids.length) { showNotice("Select at least one creator to invite."); return; }
    setPipeline(current => {
      const next = { ...current };
      for (const stage of stages) next[stage] = current[stage].filter(id => !ids.includes(id));
      next.Invited = [...next.Invited, ...ids];
      return next;
    });
    setDialog(null);
    showNotice(`${ids.length} invitation${ids.length > 1 ? "s" : ""} sent and moved to Invited.`);
  }
  function submitMessage(event: FormEvent<HTMLFormElement>, kind: "message" | "note", id: string) {
    event.preventDefault();
    if (kind === "note") setNotes(current => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
    setDialog(null);
    showNotice(kind === "message" ? `Message sent to ${candidates[id].name}.` : `Private note added to ${candidates[id].name}.`);
  }
  function primaryAction(id: string, stage: Stage) {
    if (stage === "Discovered") return move(id, "Shortlisted");
    if (stage === "Shortlisted") return setDialog({ type: "invite", id });
    if (stage === "Invited") return setDialog({ type: "message", id });
    if (stage === "Applied") return setDialog({ type: "review", id });
    showNotice(`Collaboration workspace opened for ${candidates[id].name}.`);
  }

  return <div className="app-content talent-pipeline-page">
    <header className="app-page-head"><div><span>Recruiting workflow</span><h1>Talent Pipeline</h1><p>Move every creator from discovery to selection with context, ownership, and a visible audit trail.</p></div><button className="button button-dark" type="button" onClick={() => setDialog({ type: "invite" })}><UserPlus /> Invite creators</button></header>
    <section className="pipeline-context surface"><div><Sparkle weight="fill" /><span><strong>Ramadan Made Simple</strong>{total} candidates · {pipeline.Applied.length + pipeline.Shortlisted.length} need a decision</span></div><button type="button" aria-label="Campaign pipeline options" onClick={() => showNotice("Pipeline settings: owner Maya · SLA 2 business days · invite-first visibility.")}><DotsThree /></button></section>
    <section className="talent-board">{stages.map(stage => <div className="talent-column" key={stage}><header><span>{stage}</span><b>{pipeline[stage].length}</b></header>{pipeline[stage].map(id => { const candidate = candidates[id]; return <article className="talent-card surface" key={id}>
      <div><span className="creator-avatar small">{candidate.initials}</span><span><strong>{candidate.name}</strong><small>{candidate.handle}</small></span>{candidate.fit > 0 && <b>{candidate.fit}%</b>}<button className="candidate-menu-button" type="button" aria-label={`Actions for ${candidate.name}`} aria-expanded={activeMenu === id} onClick={() => setActiveMenu(activeMenu === id ? null : id)}><DotsThree /></button></div>
      {activeMenu === id && <div className="candidate-menu" role="menu">{candidate.profileId && <Link role="menuitem" href={`/app/creators/${candidate.profileId}`}><Eye /> View intelligence</Link>}<button role="menuitem" type="button" onClick={() => { setDialog({ type: "message", id }); setActiveMenu(null); }}><ChatCircleDots /> Message creator</button><button role="menuitem" type="button" onClick={() => { setDialog({ type: "note", id }); setActiveMenu(null); }}><NotePencil /> Add private note</button><label><ArrowRight /> Move to<select aria-label={`Move ${candidate.name} to stage`} value={stage} onChange={event => move(id, event.target.value as Stage)}>{stages.map(item => <option key={item}>{item}</option>)}</select></label><button className="danger" role="menuitem" type="button" onClick={() => archive(id)}><Archive /> Reject / archive</button></div>}
      <p>{candidate.summary}</p>{notes[id] && <span className="candidate-note-count"><NotePencil /> {notes[id]} private note{notes[id] > 1 ? "s" : ""}</span>}
      <footer><span>{stage === "Selected" ? <><CheckCircle weight="fill" /> Ready for brief</> : candidate.rate}</span><button type="button" className="candidate-primary" onClick={() => primaryAction(id, stage)}>{stage === "Discovered" ? "Shortlist" : stage === "Shortlisted" ? "Invite" : stage === "Invited" ? "Follow up" : stage === "Applied" ? "Review" : "Start work"}<ArrowRight /></button></footer>
    </article>})}<button className="pipeline-add" type="button" onClick={() => setDialog({ type: "add", stage })}><PaperPlaneTilt /> Add candidate</button></div>)}</section>

    {dialog?.type === "invite" && <div className="dialog-backdrop" onMouseDown={() => setDialog(null)}><section className="dialog-card invite-candidates-dialog" role="dialog" aria-modal="true" aria-labelledby="invite-candidates-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setDialog(null)}><X /></button><span className="section-kicker">Campaign invitation</span><h2 id="invite-candidates-title">Invite creators</h2><p>Select shortlisted or discovered creators. Sending an invitation moves them to the Invited stage.</p><form className="dialog-form" action={inviteCandidates}><label className="field"><span>Campaign</span><select><option>Ramadan Made Simple</option><option>Weekday Lunch Reset</option></select></label><fieldset className="candidate-picker"><legend>Creators</legend>{inviteable.length ? inviteable.map(candidate => <label key={candidate.id}><input type="checkbox" name="candidate" value={candidate.id} defaultChecked={dialog.id === candidate.id} /><span className="creator-avatar small">{candidate.initials}</span><span><strong>{candidate.name}</strong><small>{candidate.handle} · {candidate.fit ? `${candidate.fit}% fit` : "Analysis pending"}</small></span></label>) : <p>All candidates have already been invited or reviewed. Add another candidate first.</p>}</fieldset><label className="field"><span>Invitation message</span><textarea defaultValue="Your content style and audience look relevant for Ramadan Made Simple. We would love to review your proposal." /></label><div className="dialog-actions"><button className="button button-outline" type="button" onClick={() => setDialog(null)}>Cancel</button><button className="button button-dark" type="submit" disabled={!inviteable.length}><PaperPlaneTilt /> Send invitations</button></div></form></section></div>}

    {dialog?.type === "add" && <div className="dialog-backdrop" onMouseDown={() => setDialog(null)}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="add-candidate-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setDialog(null)}><X /></button><span className="section-kicker">{dialog.stage} stage</span><h2 id="add-candidate-title">Add candidate</h2><p>Add someone found outside PRIFYN. Their profile stays marked as pending until evidence is reviewed.</p><form className="dialog-form" action={addCandidate}><label className="field"><span>Creator name</span><input name="name" required autoFocus placeholder="e.g. Rani Mahesa" /></label><label className="field"><span>Handle</span><input name="handle" required placeholder="e.g. @ranicreates" /></label><label className="field"><span>Public profile URL</span><input name="url" type="url" required placeholder="https://tiktok.com/@creator" /></label><div className="dialog-actions"><button className="button button-outline" type="button" onClick={() => setDialog(null)}>Cancel</button><button className="button button-dark" type="submit">Add to {dialog.stage}</button></div></form></section></div>}

    {(dialog?.type === "message" || dialog?.type === "note") && <div className="dialog-backdrop" onMouseDown={() => setDialog(null)}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="candidate-compose-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setDialog(null)}><X /></button><span className="section-kicker">{dialog.type === "message" ? "Creator conversation" : "Internal collaboration"}</span><h2 id="candidate-compose-title">{dialog.type === "message" ? `Message ${candidates[dialog.id].name}` : `Note about ${candidates[dialog.id].name}`}</h2><p>{dialog.type === "message" ? "This message is visible to the creator and remains in the campaign audit trail." : "Private notes are only visible to permitted brand team members."}</p><form className="dialog-form" onSubmit={event => submitMessage(event, dialog.type === "message" ? "message" : "note", dialog.id)}><label className="field"><span>{dialog.type === "message" ? "Message" : "Private note"}</span><textarea required autoFocus placeholder={dialog.type === "message" ? "Ask a question or clarify the campaign…" : "Capture screening context for your team…"} /></label><div className="dialog-actions"><button className="button button-outline" type="button" onClick={() => setDialog(null)}>Cancel</button><button className="button button-dark" type="submit">{dialog.type === "message" ? "Send message" : "Save note"}</button></div></form></section></div>}

    {dialog?.type === "review" && <div className="dialog-backdrop" onMouseDown={() => setDialog(null)}><section className="dialog-card application-review-dialog" role="dialog" aria-modal="true" aria-labelledby="application-review-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setDialog(null)}><X /></button><span className="section-kicker">Application review</span><h2 id="application-review-title">{candidates[dialog.id].name}</h2><div className="review-facts"><div><span>Proposed rate</span><strong>{candidates[dialog.id].rate}</strong></div><div><span>Campaign fit</span><strong>{candidates[dialog.id].fit}%</strong></div><div><span>Availability</span><strong>Confirmed</strong></div></div><blockquote>“I can translate the brief into a clear business story and deliver the first cut within five working days.”</blockquote><div className="review-confidence"><Sparkle weight="fill" /><span><strong>AI recommendation: review positively</strong>Audience and content style align; confirm usage rights before selection. · 88% confidence</span></div><div className="review-action-grid"><button className="button button-outline" type="button" onClick={() => { archive(dialog.id); setDialog(null); }}>Reject</button><button className="button button-outline" type="button" onClick={() => setDialog({ type: "message", id: dialog.id })}>Request information</button><button className="button button-dark" type="button" onClick={() => { move(dialog.id, "Selected"); setDialog(null); }}>Select creator</button></div></section></div>}
    {notice && <div className="toast" role="status"><CheckCircle weight="fill" />{notice}</div>}
  </div>;
}
