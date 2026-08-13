import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, BookOpenText, CalendarCheck, ChartLineUp, CheckCircle,
  FileArrowUp, Funnel, LinkSimple, Megaphone, Sparkle, UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";

export const metadata: Metadata = { title: "Docs", description: "PRIFYN product documentation for Growth OS, campaign management, imports, reporting, Creator Intelligence, and onboarding." };

const docs = [
  { id: "overview", icon: BookOpenText, title: "Product overview", copy: "PRIFYN starts as Growth OS and expands toward Business OS. The core loop is Plan → Execute → Measure → Understand → Improve.", bullets: ["Campaign Management is the system of record", "Ads and KOL are execution channels", "Recommendations must show evidence and confidence"] },
  { id: "onboarding", icon: CalendarCheck, title: "Onboarding paths", copy: "Teams can start self-serve, book an appointment, or apply online when their workflow needs guided mapping first.", bullets: ["Self-serve for teams ready to configure", "Book appointment for assisted setup", "Apply online for messy growth/reporting workflows"] },
  { id: "campaigns", icon: Megaphone, title: "Campaign Management", copy: "Every campaign owns objective, channel, budget, creative, KOL criteria, tracking, performance, and next actions.", bullets: ["Ads Campaign setup and preview", "KOL brief, applications, submissions, approval", "Campaign detail should end with a clear action"] },
  { id: "imports", icon: FileArrowUp, title: "Imports & data sources", copy: "Manual CSV/XLSX imports keep PRIFYN useful before every API connection exists.", bullets: ["Meta, TikTok, Google, Shopee, Tokopedia", "Affiliate/coupon and lead capture sheets", "Original file remains reviewable"] },
  { id: "creator", icon: UsersThree, title: "Creator Intelligence", copy: "Creator review is part of the KOL lifecycle, not a separate marketplace.", bullets: ["AI Interview Summary", "Explainable match score", "Why fit, risks, evidence, confidence, recommended action"] },
  { id: "reporting", icon: ChartLineUp, title: "Reporting", copy: "Reports should help leadership decide, not only view charts.", bullets: ["Executive, Campaigns, Creators, Attribution, Journey", "Graphs, filters, and export", "Recommendation, evidence, confidence, next action"] },
  { id: "crm-lite", icon: Funnel, title: "CRM Lite & attribution", copy: "MVP tracks lead capture and basic attribution before full commerce/ERP data arrives.", bullets: ["Lead source and status", "Campaign/ad/creator attribution", "Revenue attribution prepared for later Commerce OS"] },
  { id: "connections", icon: LinkSimple, title: "Connections", copy: "Identity login is separate from marketing and commerce permissions.", bullets: ["Connect each channel when ready", "Manual imports remain valid", "Publishing requires human confirmation"] },
];

const flow = ["Client brief", "Campaign workspace", "Ads / KOL execution", "Data import or connection", "Reports", "AI recommendation", "Next action"];

export default function DocsPage() {
  return <div className="marketing-page"><div className="subpage-header"><MarketingHeader /></div><main>
    <section className="resource-hero docs-hero"><div className="marketing-container"><span className="section-kicker">PRIFYN Docs</span><h1>How Growth OS works,<br /><em>from brief to better decision.</em></h1><p>Use this as the product guide for onboarding, campaign operations, creator workflows, imports, reporting, and explainable AI.</p><div className="page-hero-actions"><Link className="button button-light button-large" href="/book">Book walkthrough <ArrowRight /></Link><Link className="button button-ghost-light button-large" href="/apply">Apply online</Link></div></div></section>
    <section className="section section-paper"><div className="marketing-container docs-layout"><aside className="docs-toc surface"><strong>Contents</strong>{docs.map(item => <a href={`#${item.id}`} key={item.id}>{item.title}</a>)}</aside><div className="docs-main"><section className="surface docs-flow-card"><span><Sparkle weight="fill" /> Operating flow</span><div>{flow.map((item, index) => <article key={item}><b>{index + 1}</b><strong>{item}</strong>{index < flow.length - 1 && <ArrowRight />}</article>)}</div></section><div className="docs-grid">{docs.map(({ id, icon: Icon, title, copy, bullets }) => <article className="surface docs-card" id={id} key={id}><Icon weight="duotone" /><h2>{title}</h2><p>{copy}</p><div>{bullets.map(item => <span key={item}><CheckCircle weight="fill" />{item}</span>)}</div></article>)}</div></div></div></section>
    <section className="final-cta"><div className="marketing-container final-cta-inner"><span className="section-kicker light">Need a guided start?</span><h2>Docs help you understand it.<br /><em>Onboarding helps you run it.</em></h2><p>If your business flow is closer to agency-managed campaigns, start with appointment or apply online before creating a workspace.</p><div className="hero-actions centered-actions"><Link className="button button-light button-large" href="/book">Book appointment <ArrowRight /></Link><Link className="button button-ghost-light button-large" href="/apply">Apply online</Link></div></div></section>
  </main><MarketingFooter /></div>;
}
