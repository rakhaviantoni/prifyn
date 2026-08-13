import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, ChartLineUp, CheckCircle, FileArrowUp, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { PublicIntakeForm } from "@/components/public-intake-form";

export const metadata: Metadata = { title: "Book an Appointment", description: "Book a guided PRIFYN Growth OS walkthrough for campaign, KOL, reporting, and data-flow planning." };

const steps = [
  ["1", "Map current workflow", "Ads, KOL, reporting cadence, lead capture, and where the team currently loses visibility."],
  ["2", "Choose the first operating loop", "Pick one campaign or brand flow to run through Plan → Execute → Measure → Improve."],
  ["3", "Prepare the workspace", "Define campaign structure, import sources, owner roles, and the first report decision."],
];

export default function BookPage() {
  return <div className="marketing-page"><div className="subpage-header"><MarketingHeader /></div><main>
    <section className="intake-hero"><div className="marketing-container intake-hero-grid"><div><span className="eyebrow-pill"><CalendarCheck weight="fill" /> Assisted setup</span><h1>Not ready to explore alone?<br /><em>Start with a walkthrough.</em></h1><p>Some teams do not want to register, click around, and guess what matters first. Book an appointment and we will map your growth workflow before the workspace setup.</p><div className="hero-actions"><Link className="button button-light button-large" href="#book-form">Book appointment <ArrowRight /></Link><Link className="button button-ghost-light button-large" href="/apply">Apply online instead</Link></div></div><aside className="intake-proof-card"><ChartLineUp weight="duotone" /><h2>What we prepare with you</h2>{["Campaign structure", "Ads + KOL channel flow", "Manual import plan", "Lead capture path", "First reporting decision"].map(item => <span key={item}><CheckCircle weight="fill" />{item}</span>)}</aside></div></section>
    <section className="section section-paper"><div className="marketing-container guided-flow-grid">{steps.map(([number, title, copy]) => <article className="surface guided-flow-card" key={title}><b>{number}</b><h2>{title}</h2><p>{copy}</p></article>)}</div></section>
    <section className="section section-paper intake-section" id="book-form"><div className="marketing-container intake-content-grid"><div><span className="section-kicker">Appointment request</span><h2>Use this if your flow is still messy.</h2><p>Inspired by the agency-style flow where a representative translates client briefs into reporting-ready execution. PRIFYN turns that into a repeatable product workflow.</p><div className="intake-mini-list"><span><FileArrowUp /> Existing exports are enough to start</span><span><UsersThree /> Works for brand, agency, and KOL teams</span><span><CheckCircle /> We focus on the first useful decision</span></div></div><PublicIntakeForm type="appointment" /></div></section>
  </main><MarketingFooter /></div>;
}
