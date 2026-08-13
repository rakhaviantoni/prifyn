import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChartLineUp, CheckCircle, ClipboardText, Megaphone, Sparkle, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { PublicIntakeForm } from "@/components/public-intake-form";

export const metadata: Metadata = { title: "Apply Online", description: "Apply for guided PRIFYN Growth OS onboarding without creating a workspace first." };

const paths = [
  { title: "Ads reporting", icon: Megaphone, copy: "You have paid campaigns but reports do not explain what to improve." },
  { title: "KOL operations", icon: UsersThree, copy: "You manage creators, briefs, submissions, payments, and proof manually." },
  { title: "Growth intelligence", icon: Sparkle, copy: "You want recommendations backed by campaign, creator, lead, and revenue evidence." },
];

export default function ApplyPage() {
  return <div className="marketing-page"><div className="subpage-header"><MarketingHeader /></div><main>
    <section className="intake-hero apply-hero"><div className="marketing-container intake-hero-grid"><div><span className="eyebrow-pill"><ClipboardText weight="fill" /> Apply online</span><h1>Skip the empty workspace.<br /><em>Tell us your growth problem first.</em></h1><p>If you already run campaigns but your data, KOL workflow, or reporting cadence is messy, apply online and PRIFYN can shape the first operating loop around your actual business flow.</p><div className="hero-actions"><Link className="button button-light button-large" href="#apply-form">Apply online <ArrowRight /></Link><Link className="button button-ghost-light button-large" href="/book">Book appointment</Link></div></div><aside className="intake-proof-card"><ChartLineUp weight="duotone" /><h2>Good fit if you need</h2>{["Campaign setup", "Manual CSV/XLSX import", "Ads + KOL reporting", "Lead capture", "Recommended next action"].map(item => <span key={item}><CheckCircle weight="fill" />{item}</span>)}</aside></div></section>
    <section className="section section-paper"><div className="marketing-container intake-path-grid">{paths.map(({ title, icon: Icon, copy }) => <article className="surface intake-path-card" key={title}><Icon weight="duotone" /><h2>{title}</h2><p>{copy}</p></article>)}</div></section>
    <section className="section section-paper intake-section" id="apply-form"><div className="marketing-container intake-content-grid"><div><span className="section-kicker">Business intake</span><h2>We use this to recommend the right starting workflow.</h2><p>For MVP, the best entry point is not always self-serve registration. A short intake helps decide whether to start from Ads, KOL, imports, reporting, or CRM Lite.</p><div className="intake-mini-list"><span><CheckCircle /> No need to connect APIs first</span><span><CheckCircle /> Manual exports are accepted</span><span><CheckCircle /> We avoid building the wrong workflow</span></div></div><PublicIntakeForm type="application" /></div></section>
  </main><MarketingFooter /></div>;
}
