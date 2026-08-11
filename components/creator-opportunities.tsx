"use client";

import { useState } from "react";
import type * as React from "react";
import {
  BookmarkSimple, CheckCircle, ClipboardText, CurrencyCircleDollar, MapPin,
  PaperPlaneTilt, Sparkle, Target, X,
} from "@phosphor-icons/react";
import { creatorOpportunities } from "@/lib/creator-intelligence-data";
import { getCreatorBrief, type CreatorBrief } from "@/lib/creator-campaign-data";

type Opportunity = (typeof creatorOpportunities)[number];

export function CreatorOpportunities() {
  const [saved, setSaved] = useState<string[]>([]);
  const [applying, setApplying] = useState<Opportunity | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const brief = applying ? getCreatorBrief(applying.id) : null;

  function submitApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplying(null);
    setNotice("Application submitted. The same brand brief is now visible in Applications with your proposal attached.");
    window.setTimeout(() => setNotice(null), 3000);
  }

  return <div className="app-content"><header className="app-page-head"><div><span>Matched opportunities</span><h1>Campaigns worth your time.</h1><p>Ranked by fit, not by who paid for placement. Open the brand brief, check deliverables, then apply with a clear proposal.</p></div></header><section className="opportunity-grid">{creatorOpportunities.map(item => <article className="surface opportunity-card" key={item.id}><header><span className="opportunity-brand">{item.brand.slice(0, 2).toUpperCase()}</span><div><span>{item.brand}</span><h2>{item.title}</h2></div><button type="button" className={saved.includes(item.id) ? "saved" : ""} aria-label={`Save ${item.title}`} onClick={() => setSaved(current => current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id])}><BookmarkSimple weight={saved.includes(item.id) ? "fill" : "regular"} /></button></header><div className="opportunity-fit"><Sparkle weight="fill" /><span><strong>{item.fit}% match</strong>Food niche · Jakarta audience · delivery history</span></div><p>{item.deliverable}</p><div className="opportunity-meta"><span><MapPin /> Indonesia</span><span>Apply by {item.deadline}</span><strong>{item.budget}</strong></div><footer><span className="status-pill neutral">{item.status}</span><button className="button button-dark" type="button" onClick={() => setApplying(item)}>View brief & apply</button></footer></article>)}</section>{applying && brief && <BriefApplicationDialog opportunity={applying} brief={brief} onClose={() => setApplying(null)} onSubmit={submitApplication} />}{notice && <div className="toast"><CheckCircle weight="fill" />{notice}</div>}</div>;
}

function BriefApplicationDialog({ opportunity, brief, onClose, onSubmit }: { opportunity: Opportunity; brief: CreatorBrief; onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <div className="dialog-backdrop" onMouseDown={onClose}><section className="dialog-card creator-brief-dialog" role="dialog" aria-modal="true" aria-labelledby="apply-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" onClick={onClose} aria-label="Close"><X /></button><span className="section-kicker">Brand-provided brief · {brief.approvedVersion}</span><h2 id="apply-title">{opportunity.title}</h2><div className="brief-dialog-grid"><section><div className="brief-dialog-summary"><span className="opportunity-brand">{brief.brandInitials}</span><div><strong>{brief.brand}</strong><small>{brief.objective} · {brief.campaignWindow}</small></div><b>{brief.fit}% fit</b></div><p>{brief.detailBrief}</p><div className="brief-pill-grid">{brief.kpis.map(item => <span key={item.label}><Target /> <b>{item.label}</b>{item.target}</span>)}</div><div className="brief-section"><h3>Deliverables</h3>{brief.deliverables.map(item => <article key={item.title}><ClipboardText /><div><strong>{item.title}</strong><small>{item.detail} · due {item.due}</small></div><span>{item.status}</span></article>)}</div><div className="brief-section"><h3>Rules from brand</h3><ul>{brief.contentRequirements.map(item => <li key={item}>{item}</li>)}</ul></div></section><aside><div className="brief-commercial-card"><CurrencyCircleDollar weight="duotone" /><span>Creator fee</span><strong>{brief.creatorFee}</strong><small>{brief.revisionLimit}</small></div><div className="brief-mini-list"><h3>Usage rights</h3><p>{brief.usageRights}</p><h3>Tracking</h3><p>{brief.tracking.link}<br />Coupon: {brief.tracking.coupon}</p><h3>Brand contact</h3><p>{brief.brandContact.name} · {brief.brandContact.role}<br />{brief.brandContact.responseTime}</p></div></aside></div><form className="dialog-form" onSubmit={onSubmit}><label className="field"><span>Your proposed rate</span><input required defaultValue={brief.proposalDefaults.rate} /></label><label className="field"><span>Why are you a strong fit?</span><textarea required defaultValue={brief.proposalDefaults.note} /></label><label className="field"><span>Relevant portfolio URL</span><input type="url" required defaultValue={brief.proposalDefaults.portfolio} /></label><div className="dialog-actions"><button className="button button-outline" type="button" onClick={onClose}>Cancel</button><button className="button button-dark" type="submit"><PaperPlaneTilt /> Submit application</button></div></form></section></div>;
}
