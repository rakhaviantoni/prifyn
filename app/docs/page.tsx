import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, BookOpenText, CalendarCheck, ChartLineUp, CheckCircle,
  FileArrowUp, Funnel, LinkSimple, Megaphone, Sparkle, UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";

export const metadata: Metadata = { title: "Docs", description: "Learn how PRIFYN helps teams plan campaigns, manage creators, measure performance, and decide what to improve next." };

const docs = [
  { id: "overview", icon: BookOpenText, title: "Product overview", copy: "PRIFYN helps teams run a repeatable growth rhythm: plan the work, execute it, measure results, understand what happened, and improve the next round.", bullets: ["Campaigns stay organized in one place", "Ads and KOL work connect to the same goal", "Recommendations explain the evidence behind them"] },
  { id: "onboarding", icon: CalendarCheck, title: "Ways to start", copy: "Teams can create an account, book a walkthrough, or apply online when they want PRIFYN to help map the first campaign flow.", bullets: ["Create an account when the team is ready", "Book appointment for assisted setup", "Apply online when the current process is messy"] },
  { id: "campaigns", icon: Megaphone, title: "Campaign Management", copy: "Every campaign keeps the objective, channel, budget, creative, KOL needs, tracking, performance, and next action together.", bullets: ["Ads campaign setup and preview", "KOL brief, applications, submissions, approval", "Every campaign detail ends with a clear action"] },
  { id: "imports", icon: FileArrowUp, title: "Reports & data sources", copy: "PRIFYN can start from exported reports while direct channel connections are still being prepared.", bullets: ["Meta, TikTok, Google, Shopee, Tokopedia", "Affiliate links, coupon codes, and lead sheets", "Original files remain reviewable"] },
  { id: "creator", icon: UsersThree, title: "Creator Intelligence", copy: "Creator review is part of the KOL lifecycle, not a separate marketplace.", bullets: ["AI Interview Summary", "Explainable match score", "Why fit, risks, evidence, confidence, recommended action"] },
  { id: "reporting", icon: ChartLineUp, title: "Reporting", copy: "Reports should help leadership decide, not only view charts.", bullets: ["Executive, campaigns, creators, attribution, journey", "Graphs, filters, and export", "Recommendation, evidence, confidence, next action"] },
  { id: "leads", icon: Funnel, title: "Leads & attribution", copy: "PRIFYN helps show which campaigns created attention, leads, customers, and eventually revenue.", bullets: ["Lead source and status", "Campaign, ad, and creator attribution", "Revenue tracking can grow with future commerce data"] },
  { id: "connections", icon: LinkSimple, title: "Connections", copy: "Signing in with Google is different from giving PRIFYN access to ad, analytics, marketplace, or creator channels.", bullets: ["Connect each channel only when ready", "Uploaded reports remain valid", "Publishing always needs confirmation"] },
];

const flow = ["Client brief", "Campaign plan", "Ads / KOL execution", "Performance data", "Reports", "AI recommendation", "Next action"];

export default function DocsPage() {
  return <div className="marketing-page"><div className="subpage-header"><MarketingHeader /></div><main>
    <section className="resource-hero docs-hero"><div className="marketing-container"><span className="section-kicker">PRIFYN Docs</span><h1>How PRIFYN works,<br /><em>from brief to better decision.</em></h1><p>Use this guide to understand onboarding, campaign operations, creator work, uploaded reports, performance views, and explainable recommendations.</p><div className="page-hero-actions"><Link className="button button-light button-large" href="/book">Book walkthrough <ArrowRight /></Link><Link className="button button-ghost-light button-large" href="/apply">Apply online</Link></div></div></section>
    <section className="section section-paper"><div className="marketing-container docs-layout"><aside className="docs-toc surface"><strong>Contents</strong>{docs.map(item => <a href={`#${item.id}`} key={item.id}>{item.title}</a>)}</aside><div className="docs-main"><section className="surface docs-flow-card"><span><Sparkle weight="fill" /> Operating flow</span><div>{flow.map((item, index) => <article key={item}><b>{index + 1}</b><strong>{item}</strong>{index < flow.length - 1 && <ArrowRight />}</article>)}</div></section><div className="docs-grid">{docs.map(({ id, icon: Icon, title, copy, bullets }) => <article className="surface docs-card" id={id} key={id}><Icon weight="duotone" /><h2>{title}</h2><p>{copy}</p><div>{bullets.map(item => <span key={item}><CheckCircle weight="fill" />{item}</span>)}</div></article>)}</div></div></div></section>
    <section className="final-cta"><div className="marketing-container final-cta-inner"><span className="section-kicker light">Need a guided start?</span><h2>Docs help you understand it.<br /><em>Onboarding helps you run it.</em></h2><p>If your team wants help translating briefs, channels, creators, and reports into one operating flow, start with an appointment or online application.</p><div className="hero-actions centered-actions"><Link className="button button-light button-large" href="/book">Book appointment <ArrowRight /></Link><Link className="button button-ghost-light button-large" href="/apply">Apply online</Link></div></div></section>
  </main><MarketingFooter /></div>;
}
