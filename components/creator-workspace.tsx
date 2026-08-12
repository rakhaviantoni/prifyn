"use client";

import { useMemo, useState } from "react";
import { ArrowsLeftRight, Check, Funnel, MagnifyingGlass, Plus, SealCheck, Sparkle, UsersThree, X } from "@phosphor-icons/react";
import { creatorProfiles } from "@/lib/creator-intelligence-data";
import { WorkspaceLink } from "./workspace-link";

export function CreatorWorkspace() {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("All platforms");
  const [shortlist, setShortlist] = useState<string[]>(["nabila-putri"]);
  const [compare, setCompare] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const visible = useMemo(() => creatorProfiles.filter(creator => {
    const haystack = `${creator.name} ${creator.handle} ${creator.location} ${creator.niches.join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (platform === "All platforms" || creator.platforms.includes(platform));
  }), [query, platform]);
  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(null), 2400); };
  const toggleShortlist = (id: string) => setShortlist(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const toggleCompare = (id: string) => setCompare(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current);
  const comparedCreators = compare.map(id => creatorProfiles.find(item => item.id === id)).filter((creator): creator is (typeof creatorProfiles)[number] => Boolean(creator)).sort((a, b) => b.fit - a.fit);

  return <div className="app-content creator-intelligence-page">
    <header className="app-page-head"><div><span>Creator intelligence</span><h1>Find creators with evidence.</h1><p>Discover, evaluate, compare, and recruit the right talent—without a marketplace feed.</p></div><button className="button button-dark" type="button" onClick={() => setCreating(true)}><Plus weight="bold" /> Add creator</button></header>
    <section className="surface evidence-strip"><Sparkle weight="fill" /><span><strong>Starter directory.</strong> Replace these profiles with onboarded creators or verified creator records from your team.</span><small>Evidence review required before real outreach</small></section>
    <section className="creator-command surface">
      <label><MagnifyingGlass /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search creator, niche, or location" aria-label="Search creators" /></label>
      <div className="creator-filter"><Funnel /><select value={platform} onChange={event => setPlatform(event.target.value)} aria-label="Filter by platform"><option>All platforms</option><option>TikTok</option><option>Instagram</option><option>YouTube</option></select></div>
      <button type="button" className="button button-outline" onClick={() => { setQuery(""); setPlatform("All platforms"); }}>Reset</button>
    </section>
    <section className="creator-stats" aria-label="Creator intelligence summary"><article><UsersThree /><div><strong>{creatorProfiles.length}</strong><span>evaluated creators</span></div></article><article><Sparkle /><div><strong>91%</strong><span>average AI confidence</span></div></article><article><SealCheck /><div><strong>{creatorProfiles.filter(item => item.verification !== "Review").length}</strong><span>identity-verified</span></div></article></section>
    <div className="creator-results-head"><div><strong>{visible.length} creators</strong><span>Ranked for the active campaign context</span></div><span>AI scores are recommendations—not automatic decisions.</span></div>
    <section className="creator-card-grid">
      {visible.map(creator => <article className="creator-card surface" key={creator.id}>
        <div className="creator-card-top"><span className="creator-avatar">{creator.initials}</span><div><h2>{creator.name} {creator.verification !== "Review" && <SealCheck weight="fill" />}</h2><p>{creator.handle} · {creator.location}</p></div><span className="fit-score"><b>{creator.fit}%</b> fit</span></div>
        <div className="creator-tags">{creator.platforms.map(item => <span key={item}>{item}</span>)}{creator.niches.slice(0, 2).map(item => <span key={item}>{item}</span>)}</div>
        <p className="creator-summary">{creator.summary}</p>
        <div className="creator-proof"><Sparkle weight="fill" /><div><strong>Why this match</strong><p>{creator.strengths.slice(0, 2).join(" · ")}</p></div><span>Confidence 91%</span></div>
        <div className="creator-metrics"><div><span>Audience</span><strong>{creator.followers}</strong></div><div><span>Avg. views</span><strong>{creator.averageViews}</strong></div><div><span>Engagement</span><strong>{creator.engagement}</strong></div></div>
        <div className="creator-card-actions"><button type="button" className={`button ${shortlist.includes(creator.id) ? "button-soft" : "button-outline"}`} onClick={() => toggleShortlist(creator.id)}>{shortlist.includes(creator.id) ? <Check weight="bold" /> : <Plus />} {shortlist.includes(creator.id) ? "Shortlisted" : "Shortlist"}</button><button className={`icon-button ${compare.includes(creator.id) ? "selected" : ""}`} type="button" aria-label={`Compare ${creator.name}`} onClick={() => toggleCompare(creator.id)}><ArrowsLeftRight /></button><WorkspaceLink className="button button-dark" href={`/app/creators/${creator.id}`}>View intelligence</WorkspaceLink></div>
      </article>)}
    </section>
    {visible.length === 0 && <section className="surface empty-state"><MagnifyingGlass /><h2>No creators match yet</h2><p>Try a broader platform or search term. Filters never change the underlying creator evidence.</p></section>}
    {compare.length > 0 && <div className="compare-tray"><div><ArrowsLeftRight weight="bold" /><span><strong>{compare.length < 2 ? "Choose one more creator" : `${compare.length} creators ready`}</strong>{comparedCreators.map(item => item.name).join(" · ")}</span></div><button type="button" className="button button-dark" disabled={compare.length < 2} onClick={() => setComparing(true)}>{compare.length < 2 ? "Select 2+" : `Compare ${compare.length}`}</button><button type="button" className="dialog-close" aria-label="Clear comparison" onClick={() => setCompare([])}><X /></button></div>}
    {comparing && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setComparing(false)}><section className="dialog-card comparison-dialog" role="dialog" aria-modal="true" aria-labelledby="comparison-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setComparing(false)}><X /></button><span className="section-kicker">Decision workspace</span><h2 id="comparison-title">Compare with the same evidence</h2><p>Scores support a decision; they do not replace a campaign owner&apos;s review.</p><div className="comparison-grid"><div className="comparison-labels"><b>Creator</b><span>Campaign fit</span><span>Audience</span><span>Average views</span><span>Engagement</span><span>Brand safety</span><span>Rate guidance</span></div>{comparedCreators.map((creator, index) => <article key={creator.id} className={index === 0 ? "recommended" : ""}><header><span className="creator-avatar">{creator.initials}</span><div><strong>{creator.name}</strong><small>{creator.handle}</small></div>{index === 0 && <em>Best fit</em>}</header><b>{creator.fit}%</b><span>{creator.followers}</span><span>{creator.averageViews}</span><span>{creator.engagement}</span><span>{creator.scores.find(score => score.label === "Brand safety")?.score ?? "—"}/100</span><span>{creator.rate}</span><footer><WorkspaceLink href={`/app/creators/${creator.id}`}>Open intelligence</WorkspaceLink><button type="button" onClick={() => toggleShortlist(creator.id)}>{shortlist.includes(creator.id) ? "Shortlisted" : "Shortlist"}</button></footer></article>)}</div><div className="comparison-recommendation"><Sparkle weight="fill" /><span><strong>{comparedCreators[0]?.name} is the strongest current match.</strong>Higher campaign fit and relevant audience evidence. Confirm availability and usage rights before inviting.</span><small>91% confidence</small></div></section></div>}
    {creating && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setCreating(false)}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="creator-dialog-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setCreating(false)}><X /></button><span className="section-kicker">Creator profile</span><h2 id="creator-dialog-title">Add a creator for review</h2><p>Start with identity and a public social link. AI analysis remains pending until evidence is available.</p><form className="dialog-form" onSubmit={event => { event.preventDefault(); setCreating(false); showNotice("Creator added to the review queue."); }}><label className="field"><span>Creator name</span><input required autoFocus placeholder="e.g. Alya Pratama" /></label><label className="field"><span>Public profile URL</span><input type="url" required placeholder="https://tiktok.com/@creator" /></label><div className="dialog-actions"><button type="button" className="button button-outline" onClick={() => setCreating(false)}>Cancel</button><button type="submit" className="button button-dark">Add for review</button></div></form></section></div>}
    {notice && <div className="toast" role="status"><Sparkle weight="fill" />{notice}</div>}
  </div>;
}
