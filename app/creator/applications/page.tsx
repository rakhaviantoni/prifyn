import Link from "next/link";
import { ArrowRight, ClipboardText, PaperPlaneTilt, UserCircle } from "@phosphor-icons/react/dist/ssr";

export default function ApplicationsPage() {
  return <div className="app-content">
    <header className="app-page-head"><div><span>Application tracking</span><h1>Applications</h1><p>Applications will appear here after you apply to brand campaigns from PRIFYN opportunities.</p></div></header>
    <section className="surface empty-state creator-empty-state">
      <PaperPlaneTilt weight="duotone" />
      <h2>No applications yet</h2>
      <p>Complete your creator profile first, then apply to campaigns that match your audience, niche, rate, and availability.</p>
      <div className="empty-actions">
        <Link className="button button-dark" href="/creator/opportunities">Browse opportunities <ArrowRight /></Link>
        <Link className="button button-outline" href="/creator/profile"><UserCircle /> Complete profile</Link>
      </div>
    </section>
    <section className="creator-command-grid">
      <article className="surface creator-command-card"><ClipboardText weight="duotone" /><div><small>What appears here</small><h2>Brief, proposal, status, and next action.</h2><p>When a brand reviews your proposal, PRIFYN will show the campaign brief, your submitted rate, agreement state, and workroom link.</p></div></article>
      <article className="surface creator-command-card"><PaperPlaneTilt weight="duotone" /><div><small>Application quality</small><h2>Strong proposals are specific.</h2><p>Mention relevant portfolio links, expected timeline, usage-rights assumptions, and how you will track results.</p></div></article>
    </section>
  </div>;
}
