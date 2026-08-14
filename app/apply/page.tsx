import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChartLineUp, CheckCircle, ClipboardText, Megaphone, Sparkle, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { PublicIntakeForm } from "@/components/public-intake-form";

export const metadata: Metadata = { title: "Apply Online", description: "Tell PRIFYN about your growth problem before setting up the platform." };

const paths = [
  { title: "Ads reporting", icon: Megaphone, copy: "You have paid campaigns but reports do not explain what to improve." },
  { title: "KOL operations", icon: UsersThree, copy: "You manage creators, briefs, submissions, payments, and proof manually." },
  { title: "Growth intelligence", icon: Sparkle, copy: "You want recommendations backed by campaign, creator, lead, and revenue evidence." },
];

export default function ApplyPage() {
  return <div className="marketing-page"><div className="subpage-header"><MarketingHeader /></div><main>
    <section className="intake-hero apply-hero"><div className="marketing-container intake-hero-grid"><div><span className="eyebrow-pill"><ClipboardText weight="fill" /> Apply online</span><h1>Tell us your growth problem first.<br /><em>We’ll help choose the right start.</em></h1><p>If campaigns are already running but the briefs, creators, reports, or follow-up leads feel scattered, apply online and PRIFYN will help shape the first operating rhythm around your real business flow.</p><div className="hero-actions"><Link className="button button-light button-large" href="#apply-form">Apply online <ArrowRight /></Link><Link className="button button-ghost-light button-large" href="/book">Book appointment</Link></div></div><aside className="intake-proof-card"><ChartLineUp weight="duotone" /><h2>Good fit if you need</h2>{["Campaign setup", "Ads and KOL reporting", "Creator coordination", "Lead follow-up", "Clear next action"].map(item => <span key={item}><CheckCircle weight="fill" />{item}</span>)}</aside></div></section>
    <section className="section section-paper"><div className="marketing-container intake-path-grid">{paths.map(({ title, icon: Icon, copy }) => <article className="surface intake-path-card" key={title}><Icon weight="duotone" /><h2>{title}</h2><p>{copy}</p></article>)}</div></section>
    <section className="section section-paper intake-section" id="apply-form"><div className="marketing-container intake-content-grid"><div><span className="section-kicker">Business intake</span><h2>Start from the problem, not from setup.</h2><p>A short intake helps us understand whether your first priority is paid ads, KOL campaigns, performance reports, lead follow-up, or a cleaner campaign process.</p><div className="intake-mini-list"><span><CheckCircle /> No need to connect channels first</span><span><CheckCircle /> Existing reports are enough to start</span><span><CheckCircle /> We focus on the first useful decision</span></div></div><PublicIntakeForm type="application" /></div></section>
  </main><MarketingFooter /></div>;
}
