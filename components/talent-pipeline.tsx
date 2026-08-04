"use client";

import { useState } from "react";
import { ArrowRight, ChatCircleDots, CheckCircle, DotsThree, PaperPlaneTilt, Sparkle, UserPlus } from "@phosphor-icons/react";
import { creatorProfiles } from "@/lib/creator-intelligence-data";

const stages = ["Discovered", "Shortlisted", "Invited", "Applied", "Selected"] as const;
type Stage = typeof stages[number];
const seed: Record<Stage, string[]> = { Discovered: ["alya-pratama"], Shortlisted: ["dimas-wibowo", "sarah-amalia"], Invited: ["ardian-prakoso"], Applied: ["kevin-tan"], Selected: ["nabila-putri"] };

export function TalentPipeline() {
  const [pipeline, setPipeline] = useState(seed);
  const [notice, setNotice] = useState<string | null>(null);
  function advance(id: string, stage: Stage) {
    const index = stages.indexOf(stage);
    if (index === stages.length - 1) return;
    setPipeline(current => ({ ...current, [stage]: current[stage].filter(item => item !== id), [stages[index + 1]]: [...current[stages[index + 1]], id] }));
    setNotice(`Creator moved to ${stages[index + 1]}.`); window.setTimeout(() => setNotice(null), 2200);
  }
  return <div className="app-content"><header className="app-page-head"><div><span>Recruiting workflow</span><h1>Talent Pipeline</h1><p>Move every creator from discovery to selection with context, ownership, and a visible audit trail.</p></div><button className="button button-dark" type="button" onClick={() => { setNotice("Invitation composer is ready from any creator profile."); window.setTimeout(() => setNotice(null), 2200); }}><UserPlus /> Invite creators</button></header><section className="pipeline-context surface"><div><Sparkle weight="fill" /><span><strong>Ramadan Made Simple</strong>6 candidates · 2 need a decision today</span></div><button type="button"><DotsThree /></button></section><section className="talent-board">{stages.map(stage => <div className="talent-column" key={stage}><header><span>{stage}</span><b>{pipeline[stage].length}</b></header>{pipeline[stage].map(id => { const creator = creatorProfiles.find(item => item.id === id)!; return <article className="talent-card surface" key={id}><div><span className="creator-avatar small">{creator.initials}</span><span><strong>{creator.name}</strong><small>{creator.handle}</small></span><b>{creator.fit}%</b></div><p>{creator.strengths[0]} · {creator.platforms[0]}</p><footer>{stage === "Applied" ? <button type="button" onClick={() => setNotice("Application review opened with rate, answers, and evidence.")}><ChatCircleDots /> Review</button> : <span>{stage === "Selected" ? <><CheckCircle weight="fill" /> Ready for brief</> : `${creator.rate}`}</span>}{stage !== "Selected" && <button type="button" className="advance-button" aria-label={`Move ${creator.name} forward`} onClick={() => advance(id, stage)}><ArrowRight /></button>}</footer></article>})}<button className="pipeline-add" type="button" onClick={() => setNotice(`Add a creator to ${stage}.`)}><PaperPlaneTilt /> Add candidate</button></div>)}</section>{notice && <div className="toast" role="status"><CheckCircle weight="fill" />{notice}</div>}</div>;
}
