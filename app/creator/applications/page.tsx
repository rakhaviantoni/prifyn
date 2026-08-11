"use client";

import { useState } from "react";
import {
  ArrowRight, CheckCircle, Clock, CurrencyCircleDollar, FileText, PaperPlaneTilt,
  ShieldCheck, X,
} from "@phosphor-icons/react";
import { getCreatorBrief } from "@/lib/creator-campaign-data";

const applications = [
  { id: "weekday-lunch-reset", title: "Weekday Lunch Reset", brand: "Dapur Saji", status: "Shortlisted", next: "Brand reviewing your rate", tone: "shortlisted" },
  { id: "ramadan-made-simple", title: "Ramadan Made Simple", brand: "Nusa Spice", status: "Selected", next: "Agreement accepted · content in production", tone: "selected" },
  { id: "morning-rituals", title: "Morning Rituals", brand: "Kopi Pulang", status: "Applied", next: "Submitted 1 Aug 2026", tone: "applied" },
];

export default function ApplicationsPage() {
  const [selected, setSelected] = useState<(typeof applications)[number] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const brief = selected ? getCreatorBrief(selected.id) : null;
  const selectedReady = selected?.status === "Selected";

  function notify(value: string) {
    setNotice(value);
    window.setTimeout(() => setNotice(null), 2600);
  }

  return <div className="app-content"><header className="app-page-head"><div><span>Application tracking</span><h1>Applications</h1><p>Every application points back to the brand brief, your proposal, agreement status, and next action.</p></div></header><section className="surface application-list">{applications.map(item => <article key={item.title} className={selected?.id === item.id ? "selected-row" : ""}><span className={`application-icon ${item.tone}`}>{item.status === "Selected" ? <CheckCircle weight="fill" /> : item.status === "Applied" ? <PaperPlaneTilt /> : <Clock />}</span><div><span>{item.brand}</span><h2>{item.title}</h2><p>{item.next}</p></div><span className={`status-pill ${item.status === "Selected" ? "" : "neutral"}`}>{item.status}</span><button className="icon-button" type="button" aria-label={`Open ${item.title}`} onClick={() => setSelected(item)}><ArrowRight /></button></article>)}</section>{selected && brief && <div className="dialog-backdrop" onMouseDown={() => setSelected(null)}><section className="dialog-card application-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="application-detail-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setSelected(null)}><X /></button><span className="section-kicker">Application detail</span><h2 id="application-detail-title">{selected.title}</h2><div className="application-detail-grid"><section><article><FileText weight="duotone" /><div><small>Brand brief</small><strong>{brief.approvedVersion}</strong><p>{brief.detailBrief}</p></div></article><article><CurrencyCircleDollar weight="duotone" /><div><small>Your proposal</small><strong>{brief.proposalDefaults.rate}</strong><p>{brief.proposalDefaults.note}</p></div></article><article><ShieldCheck weight="duotone" /><div><small>Agreement</small><strong>{selectedReady ? "Accepted by creator and brand" : "Waiting brand decision"}</strong><p>{brief.usageRights}</p></div></article></section><aside><h3>Next action</h3><p>{selectedReady ? "Open the workroom to upload the first cut, respond to revision requests, and submit proof after publishing." : "Wait for the brand to confirm selection. You can still update proposal notes before final approval."}</p><div className="brief-mini-list"><h3>Deliverables</h3>{brief.deliverables.map(item => <p key={item.title}><strong>{item.title}</strong><br />{item.detail} · {item.status}</p>)}</div><div className="dialog-actions stacked"><button type="button" className="button button-outline" onClick={() => notify("Proposal note updated for this application.")}>Update proposal note</button><a className="button button-dark" href={selectedReady ? "/creator/campaigns" : "/creator/opportunities"}>{selectedReady ? "Open workroom" : "Find more campaigns"} <ArrowRight /></a></div></aside></div></section></div>}{notice && <div className="toast"><CheckCircle weight="fill" />{notice}</div>}</div>;
}
