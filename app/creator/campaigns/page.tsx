import Link from "next/link";
import {
  ArrowRight, CalendarCheck, ClipboardText, FileArrowUp, LinkSimple, ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";

export default function CreatorCampaignsPage() {
  return <div className="app-content">
    <header className="app-page-head"><div><span>Campaign workrooms</span><h1>Campaigns</h1><p>Your approved brand collaborations will appear here with briefs, submissions, revisions, publish schedules, proof, tracking, and payment milestones.</p></div></header>
    <section className="surface empty-state creator-empty-state">
      <ClipboardText weight="duotone" />
      <h2>No active campaign workrooms yet</h2>
      <p>After a brand selects you, PRIFYN will create a workroom connected to the approved brief and deliverables.</p>
      <div className="empty-actions">
        <Link className="button button-dark" href="/creator/opportunities">Find campaigns <ArrowRight /></Link>
        <Link className="button button-outline" href="/creator/applications">Check applications</Link>
      </div>
    </section>
    <section className="workroom-grid connected">
      <section className="surface brief-summary wide"><span>Workroom workflow</span><h2>What PRIFYN will track once a campaign starts</h2><div className="creator-deliverable-list">
        {[["Brand brief", "Objective, deliverables, do/don’t list, usage rights, and KPI target", "Before work starts"], ["Submission", "Draft upload, notes, and brand review status", "During production"], ["Revision", "Requested changes, revision limit, and creator response", "If needed"], ["Publish proof", "Published URL, screenshots, coupon/link proof, and 72h snapshot", "After publish"]].map(([title, detail, due]) => <article key={title}><FileArrowUp weight="duotone" /><div><strong>{title}</strong><small>{detail}</small></div><span>{due}</span><b>Pending</b></article>)}
      </div></section>
      <aside className="surface creator-tracking-card"><div><LinkSimple weight="duotone" /><div><span>Tracking</span><h2>Links and coupons connect your work to results.</h2><p>Brand reporting can combine assigned links, coupon codes, proof screenshots, and platform/marketplace imports.</p></div></div><div><span>No assigned link yet</span><strong>Waiting for brand campaign</strong></div></aside>
    </section>
    <section className="creator-command-grid">
      <article className="surface creator-command-card"><CalendarCheck weight="duotone" /><div><small>Schedule</small><h2>Publish windows become clear after approval.</h2><p>PRIFYN will show due dates, publish windows, and task status once a brand campaign is assigned.</p></div></article>
      <article className="surface creator-command-card"><ShieldCheck weight="duotone" /><div><small>Payment</small><h2>Milestones follow the approved brief.</h2><p>Payment status will move from pending to approved to paid after brand review and proof approval.</p></div></article>
    </section>
  </div>;
}
