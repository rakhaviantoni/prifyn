"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChartLineUp, CheckCircle, Lightbulb, Target, UsersThree } from "@phosphor-icons/react";

const items = [
  { id: "plan", number: "01", label: "Plan", title: "Plan with intent", copy: "Turn a business outcome into an objective, budget, brief, audience, and readiness checklist.", icon: Target, signal: "Campaign readiness", value: "86%", note: "2 launch checks need an owner" },
  { id: "execute", number: "02", label: "Execute", title: "Keep work accountable", copy: "Coordinate creators, deliverables, reviews, revisions, publish dates, and payment milestones.", icon: UsersThree, signal: "Creator delivery", value: "8 / 10", note: "2 first cuts due Thursday" },
  { id: "measure", number: "03", label: "Measure", title: "Connect activity to outcome", copy: "Read spend, content, conversions, and revenue using visible metric definitions and attribution assumptions.", icon: ChartLineUp, signal: "Attributed ROAS", value: "3.42×", note: "Last-touch · 7-day window" },
  { id: "decide", number: "04", label: "Decide", title: "Act with evidence", copy: "Turn the diagnosis into a recommended action with evidence, confidence, owner, and review date.", icon: Lightbulb, signal: "Decision confidence", value: "High", note: "4 verified signals · 1 limitation" },
] as const;

export function GrowthBento() {
  const [active, setActive] = useState<(typeof items)[number]["id"]>("plan");
  const selected = items.find(item => item.id === active)!;
  const SelectedIcon = selected.icon;
  return <div className="marketing-container growth-bento">
    <section className="bento-focus" aria-live="polite"><div className="bento-focus-head"><span><SelectedIcon weight="duotone" /></span><div><small>Active workflow · {selected.label}</small><h3>{selected.title}</h3></div><b>{selected.number}</b></div><p>{selected.copy}</p><div className="bento-decision-preview"><span>{selected.signal}</span><strong>{selected.value}</strong><small>{selected.note}</small><i><b style={{ width: active === "plan" ? "86%" : active === "execute" ? "80%" : active === "measure" ? "72%" : "92%" }} /></i></div><footer><span><CheckCircle weight="fill" /> Every step ends with a next action</span><Link href="/features">Explore the workflow <ArrowRight /></Link></footer></section>
    <div className="bento-steps">{items.map(({ id, number, label, title, icon: Icon }) => <button key={id} type="button" className={active === id ? "active" : ""} aria-pressed={active === id} onClick={() => setActive(id)} onMouseEnter={() => setActive(id)}><span><Icon weight="duotone" /></span><b>{number}</b><small>{label}</small><strong>{title}</strong><ArrowRight /></button>)}</div>
    <section className="bento-evidence"><div><span>Evidence layer</span><strong>Campaigns + creators + revenue + readiness</strong></div><div className="bento-sources"><i /><i /><i /><i /></div><p>PRIFYN keeps the source, freshness, assumptions, and confidence attached to every recommendation.</p></section>
  </div>;
}
