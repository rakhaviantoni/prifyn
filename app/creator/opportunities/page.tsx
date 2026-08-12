import Link from "next/link";
import { ArrowRight, Briefcase, FileArrowUp, Sparkle, UserCircle } from "@phosphor-icons/react/dist/ssr";

export default function OpportunitiesPage() {
  return <div className="app-content">
    <header className="app-page-head"><div><span>Matched opportunities</span><h1>Opportunities</h1><p>Campaign opportunities will appear when brands publish briefs that match your profile, niche, platform, location, and availability.</p></div></header>
    <section className="surface empty-state creator-empty-state">
      <Briefcase weight="duotone" />
      <h2>No matched campaigns yet</h2>
      <p>Complete your profile and portfolio so PRIFYN can match you to real brand campaigns when they become available.</p>
      <div className="empty-actions">
        <Link className="button button-dark" href="/creator/profile"><UserCircle /> Complete profile</Link>
        <Link className="button button-outline" href="/creator/applications">View applications <ArrowRight /></Link>
      </div>
    </section>
    <section className="creator-command-grid">
      <article className="surface creator-command-card"><Sparkle weight="duotone" /><div><small>Matching</small><h2>Fit depends on evidence, not follower count only.</h2><p>PRIFYN will use your niches, social links, audience, portfolio, availability, rate preferences, and campaign history.</p></div></article>
      <article className="surface creator-command-card"><FileArrowUp weight="duotone" /><div><small>Portfolio</small><h2>Upload proof before applying.</h2><p>Campaign results, testimonials, and public content links help brands understand your style and expected performance.</p></div></article>
    </section>
  </div>;
}
