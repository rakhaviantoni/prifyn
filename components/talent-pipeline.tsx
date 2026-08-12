"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Archive,
  ArrowRight,
  CaretRight,
  ChatCircleDots,
  CheckCircle,
  DotsThree,
  Eye,
  NotePencil,
  PaperPlaneTilt,
  Plus,
  Sparkle,
  UserPlus,
  Warning,
  X,
} from "@phosphor-icons/react";
import { creatorProfiles } from "@/lib/creator-intelligence-data";
import { WorkspaceLink } from "./workspace-link";

const stages = ["Discovered", "Shortlisted", "Invited", "Applied", "Selected"] as const;
type Stage = typeof stages[number];
type Candidate = { id: string; profileId?: string; name: string; handle: string; initials: string; fit: number; rate: string; summary: string };
type Dialog = { type: "invite"; id?: string } | { type: "add"; stage: Stage } | { type: "actions" | "message" | "note" | "review" | "archive"; id: string } | null;

const seedPipeline: Record<Stage, string[]> = { Discovered: ["alya-pratama"], Shortlisted: ["dimas-wibowo", "sarah-amalia"], Invited: ["ardian-prakoso"], Applied: ["kevin-tan"], Selected: ["nabila-putri"] };
const seedCandidates = Object.fromEntries(creatorProfiles.map(creator => [creator.id, { id: creator.id, profileId: creator.id, name: creator.name, handle: creator.handle, initials: creator.initials, fit: creator.fit, rate: creator.rate, summary: `${creator.strengths[0]} · ${creator.platforms[0]}` }])) as Record<string, Candidate>;

export function TalentPipeline() {
  const [pipeline, setPipeline] = useState(seedPipeline);
  const [candidates, setCandidates] = useState(seedCandidates);
  const [notes, setNotes] = useState<Record<string, number>>({});
  const [messages, setMessages] = useState<Record<string, number>>({});
  const [moveTarget, setMoveTarget] = useState<Stage>("Discovered");
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
    showNotice(`${candidates[id].name} moved to ${target}.`);
  }
  function archive(id: string) {
    const source = currentStage(id);
    if (!source) return;
    setPipeline(current => ({ ...current, [source]: current[source].filter(item => item !== id) }));
    setDialog(null);
    showNotice(`${candidates[id].name} archived from this campaign. The profile remains in Creator Discovery.`);
  }
  function openActions(id: string) {
    setMoveTarget(currentStage(id) ?? "Discovered");
    setDialog({ type: "actions", id });
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
    else setMessages(current => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
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
    <section className="pipeline-context surface"><div><Sparkle weight="fill" /><span><strong>Campaign talent pipeline</strong>{total} candidates · {pipeline.Applied.length + pipeline.Shortlisted.length} need a decision · starter directory until creator records are connected</span></div><button type="button" aria-label="Campaign pipeline options" onClick={() => showNotice("Pipeline settings: choose campaign context, owner, review SLA, and invite visibility.")}><DotsThree /></button></section>
    <section className="talent-board">{stages.map(stage => <div className="talent-column" key={stage}><header><span>{stage}</span><b>{pipeline[stage].length}</b></header>{pipeline[stage].map(id => { const candidate = candidates[id]; return <article className="talent-card surface" key={id}>
      <div><span className="creator-avatar small">{candidate.initials}</span><span><strong>{candidate.name}</strong><small>{candidate.handle}</small></span>{candidate.fit > 0 && <b>{candidate.fit}%</b>}<button className="candidate-menu-button" type="button" aria-label={`Open actions for ${candidate.name}`} onClick={() => openActions(id)}><DotsThree weight="bold" /></button></div>
      <p>{candidate.summary}</p>{(notes[id] || messages[id]) && <div className="candidate-activity">{notes[id] && <span><NotePencil /> {notes[id]} note{notes[id] > 1 ? "s" : ""}</span>}{messages[id] && <span><ChatCircleDots /> {messages[id]} sent</span>}</div>}
      <footer><span>{stage === "Selected" ? <><CheckCircle weight="fill" /> Ready for brief</> : candidate.rate}</span><button type="button" className="candidate-primary" onClick={() => primaryAction(id, stage)}>{stage === "Discovered" ? "Shortlist" : stage === "Shortlisted" ? "Invite" : stage === "Invited" ? "Follow up" : stage === "Applied" ? "Review" : "Start work"}<ArrowRight /></button></footer>
    </article>})}<button className="pipeline-add" type="button" onClick={() => setDialog({ type: "add", stage })}><span><Plus weight="bold" /></span><span><strong>Add candidate</strong><small>to {stage}</small></span></button></div>)}</section>

    {dialog?.type === "invite" && <div className="dialog-backdrop" onMouseDown={() => setDialog(null)}><section className="dialog-card invite-candidates-dialog" role="dialog" aria-modal="true" aria-labelledby="invite-candidates-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setDialog(null)}><X /></button><span className="section-kicker">Campaign invitation</span><h2 id="invite-candidates-title">Invite creators</h2><p>Select shortlisted or discovered creators. Sending an invitation moves them to the Invited stage.</p><form className="dialog-form" onSubmit={event => { event.preventDefault(); inviteCandidates(new FormData(event.currentTarget)); }}><label className="field"><span>Campaign</span><select><option>Ramadan Made Simple</option><option>Weekday Lunch Reset</option></select></label><fieldset className="candidate-picker"><legend>Creators</legend>{inviteable.length ? inviteable.map(candidate => <label key={candidate.id}><input type="checkbox" name="candidate" value={candidate.id} defaultChecked={dialog.id === candidate.id} /><span className="creator-avatar small">{candidate.initials}</span><span><strong>{candidate.name}</strong><small>{candidate.handle} · {candidate.fit ? `${candidate.fit}% fit` : "Analysis pending"}</small></span></label>) : <p>All candidates have already been invited or reviewed. Add another candidate first.</p>}</fieldset><label className="field"><span>Invitation message</span><textarea defaultValue="Your content style and audience look relevant for Ramadan Made Simple. We would love to review your proposal." /></label><div className="dialog-actions"><button className="button button-outline" type="button" onClick={() => setDialog(null)}>Cancel</button><button className="button button-dark" type="submit" disabled={!inviteable.length}><PaperPlaneTilt /> Send invitations</button></div></form></section></div>}

    {dialog?.type === "add" && <div className="dialog-backdrop" onMouseDown={() => setDialog(null)}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="add-candidate-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setDialog(null)}><X /></button><span className="section-kicker">{dialog.stage} stage</span><h2 id="add-candidate-title">Add candidate</h2><p>Add someone found outside PRIFYN. Their profile stays marked as pending until evidence is reviewed.</p><form className="dialog-form" onSubmit={event => { event.preventDefault(); addCandidate(new FormData(event.currentTarget)); }}><label className="field"><span>Creator name</span><input name="name" required autoFocus placeholder="e.g. Rani Mahesa" /></label><label className="field"><span>Handle</span><input name="handle" required placeholder="e.g. @ranicreates" /></label><label className="field"><span>Public profile URL</span><input name="url" type="url" required placeholder="https://tiktok.com/@creator" /></label><div className="dialog-actions"><button className="button button-outline" type="button" onClick={() => setDialog(null)}>Cancel</button><button className="button button-dark" type="submit">Add to {dialog.stage}</button></div></form></section></div>}

    {dialog?.type === "actions" && <div className="dialog-backdrop" onMouseDown={() => setDialog(null)}><section className="dialog-card candidate-action-dialog" role="dialog" aria-modal="true" aria-labelledby="candidate-actions-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setDialog(null)}><X /></button><div className="candidate-action-head"><span className="creator-avatar">{candidates[dialog.id].initials}</span><div><span className="section-kicker">Creator actions</span><h2 id="candidate-actions-title">{candidates[dialog.id].name}</h2><p>{candidates[dialog.id].handle} · {currentStage(dialog.id)}</p></div>{candidates[dialog.id].fit > 0 && <strong>{candidates[dialog.id].fit}% fit</strong>}</div><div className="candidate-action-list">{candidates[dialog.id].profileId ? <WorkspaceLink href={`/app/creators/${candidates[dialog.id].profileId}`}><span><Eye weight="duotone" /></span><div><strong>View intelligence</strong><small>Review evidence, scores, brand fit, and campaign history.</small></div><CaretRight /></WorkspaceLink> : <button type="button" disabled><span><Eye weight="duotone" /></span><div><strong>Intelligence pending</strong><small>Complete evidence review before opening a profile.</small></div></button>}<button type="button" onClick={() => setDialog({ type: "message", id: dialog.id })}><span><ChatCircleDots weight="duotone" /></span><div><strong>Message creator</strong><small>Send a campaign message and record it in the activity trail.</small></div><CaretRight /></button><button type="button" onClick={() => setDialog({ type: "note", id: dialog.id })}><span><NotePencil weight="duotone" /></span><div><strong>Add private note</strong><small>Capture internal screening context for permitted team members.</small></div><CaretRight /></button></div><div className="candidate-move-control"><div><strong>Move to another stage</strong><small>Current stage: {currentStage(dialog.id)}</small></div><select aria-label={`Move ${candidates[dialog.id].name} to stage`} value={moveTarget} onChange={event => setMoveTarget(event.target.value as Stage)}>{stages.map(item => <option key={item}>{item}</option>)}</select><button className="button button-dark" type="button" disabled={moveTarget === currentStage(dialog.id)} onClick={() => { move(dialog.id, moveTarget); setDialog(null); }}>Move creator</button></div><button className="candidate-archive-action" type="button" onClick={() => setDialog({ type: "archive", id: dialog.id })}><Archive /> <span><strong>Reject / archive</strong><small>Remove from this campaign without deleting the creator profile.</small></span><CaretRight /></button></section></div>}

    {(dialog?.type === "message" || dialog?.type === "note") && <div className="dialog-backdrop" onMouseDown={() => setDialog(null)}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="candidate-compose-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setDialog(null)}><X /></button><span className="section-kicker">{dialog.type === "message" ? "Creator conversation" : "Internal collaboration"}</span><h2 id="candidate-compose-title">{dialog.type === "message" ? `Message ${candidates[dialog.id].name}` : `Note about ${candidates[dialog.id].name}`}</h2><p>{dialog.type === "message" ? "This message is visible to the creator and remains in the campaign audit trail." : "Private notes are only visible to permitted brand team members."}</p><form className="dialog-form" onSubmit={event => submitMessage(event, dialog.type === "message" ? "message" : "note", dialog.id)}><label className="field"><span>{dialog.type === "message" ? "Message" : "Private note"}</span><textarea required autoFocus placeholder={dialog.type === "message" ? "Ask a question or clarify the campaign…" : "Capture screening context for your team…"} /></label><div className="dialog-actions"><button className="button button-outline" type="button" onClick={() => setDialog(null)}>Cancel</button><button className="button button-dark" type="submit">{dialog.type === "message" ? "Send message" : "Save note"}</button></div></form></section></div>}

    {dialog?.type === "review" && <div className="dialog-backdrop" onMouseDown={() => setDialog(null)}><section className="dialog-card application-review-dialog" role="dialog" aria-modal="true" aria-labelledby="application-review-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setDialog(null)}><X /></button><span className="section-kicker">Application review</span><h2 id="application-review-title">{candidates[dialog.id].name}</h2><div className="review-facts"><div><span>Proposed rate</span><strong>{candidates[dialog.id].rate}</strong></div><div><span>Campaign fit</span><strong>{candidates[dialog.id].fit}%</strong></div><div><span>Availability</span><strong>Confirmed</strong></div></div><blockquote>“I can translate the brief into a clear business story and deliver the first cut within five working days.”</blockquote><div className="review-confidence"><Sparkle weight="fill" /><span><strong>AI recommendation: review positively</strong>Audience and content style align; confirm usage rights before selection. · 88% confidence</span></div><div className="review-action-grid"><button className="button button-outline" type="button" onClick={() => { archive(dialog.id); setDialog(null); }}>Reject</button><button className="button button-outline" type="button" onClick={() => setDialog({ type: "message", id: dialog.id })}>Request information</button><button className="button button-dark" type="button" onClick={() => { move(dialog.id, "Selected"); setDialog(null); }}>Select creator</button></div></section></div>}
    {dialog?.type === "archive" && <div className="dialog-backdrop" onMouseDown={() => setDialog(null)}><section className="dialog-card archive-dialog" role="alertdialog" aria-modal="true" aria-labelledby="archive-candidate-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setDialog(null)}><X /></button><span className="archive-dialog-icon"><Warning weight="fill" /></span><h2 id="archive-candidate-title">Archive {candidates[dialog.id].name}?</h2><p>This removes the creator from Ramadan Made Simple. Their intelligence profile and previous activity remain available.</p><div className="dialog-actions"><button className="button button-outline" type="button" onClick={() => setDialog({ type: "actions", id: dialog.id })}>Keep creator</button><button className="button button-danger" type="button" onClick={() => archive(dialog.id)}><Archive /> Archive creator</button></div></section></div>}
    {notice && <div className="toast" role="status"><CheckCircle weight="fill" />{notice}</div>}
  </div>;
}
