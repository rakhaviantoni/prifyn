import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, ChartLineUp, CheckCircle, FileArrowUp, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { AppointmentLinkActions } from "@/components/appointment-link-actions";
import { PublicIntakeForm } from "@/components/public-intake-form";

export const metadata: Metadata = { title: "Book an Appointment", description: "Book a guided PRIFYN Growth OS walkthrough for campaign, KOL, reporting, and data-flow planning." };

const steps = [
  ["1", "Map how growth runs today", "Ads, KOL, reports, leads, and where the team currently loses visibility."],
  ["2", "Choose the first campaign rhythm", "Pick one campaign or brand flow to run through Plan → Execute → Measure → Improve."],
  ["3", "Prepare the starting setup", "Define campaign structure, data sources, owners, and the first decision the report should support."],
];

export default async function BookPage({ searchParams }: { searchParams?: Promise<{ reschedule?: string; cancel?: string }> }) {
  const params = await searchParams;
  const token = params?.reschedule || params?.cancel;
  const mode = params?.cancel ? "cancel" : "reschedule";
  return <div className="marketing-page"><div className="subpage-header"><MarketingHeader /></div><main>
    <section className="intake-hero"><div className="marketing-container intake-hero-grid"><div><span className="eyebrow-pill"><CalendarCheck weight="fill" /> Assisted setup</span><h1>Not ready to explore alone?<br /><em>Start with a walkthrough.</em></h1><p>Some teams do not want to register, click around, and guess what matters first. Book an appointment and we will map the campaign flow before asking your team to set everything up.</p><div className="hero-actions"><Link className="button button-light button-large" href="#book-form">Book appointment <ArrowRight /></Link><Link className="button button-ghost-light button-large" href="/apply">Apply online instead</Link></div></div><aside className="intake-proof-card"><ChartLineUp weight="duotone" /><h2>What we prepare with you</h2>{["Campaign structure", "Ads + KOL channel flow", "Report upload plan", "Lead follow-up path", "First reporting decision"].map(item => <span key={item}><CheckCircle weight="fill" />{item}</span>)}</aside></div></section>
    <section className="section section-paper"><div className="marketing-container guided-flow-grid">{steps.map(([number, title, copy]) => <article className="surface guided-flow-card" key={title}><b>{number}</b><h2>{title}</h2><p>{copy}</p></article>)}</div></section>
    <section className="section section-paper intake-section" id="book-form"><div className="marketing-container intake-content-grid"><div><span className="section-kicker">{token ? "Appointment link" : "Appointment request"}</span><h2>{token ? "Manage your walkthrough." : "Use this if your flow is still messy."}</h2><p>{token ? "You can request a new time or cancel this walkthrough. PRIFYN will keep the client desk updated." : "Best for teams that want PRIFYN to translate briefs, campaigns, channels, creators, and reports into one clear operating flow."}</p><div className="intake-mini-list"><span><FileArrowUp /> Existing reports are enough to start</span><span><UsersThree /> Works for brand, agency, and KOL teams</span><span><CheckCircle /> We focus on the first useful decision</span></div></div>{token ? <AppointmentLinkActions token={token} mode={mode} /> : <PublicIntakeForm type="appointment" />}</div></section>
  </main><MarketingFooter /></div>;
}
