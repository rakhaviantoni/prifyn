import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { MarketingFooter } from "./marketing-footer";
import { MarketingHeader } from "./marketing-header";
import { canonicalAuthUrl } from "@/lib/portal-url";

type Solution = {
  audience: string;
  title: string;
  accent: string;
  description: string;
  proof: string[];
  problemTitle: string;
  problems: Array<{ number: string; title: string; copy: string }>;
  workflow: Array<{ label: string; title: string; copy: string }>;
  outcome: string;
};

export function SolutionPage({ solution }: { solution: Solution }) {
  const portal = solution.audience.toLowerCase().includes("creator") ? "creator" : "app";
  const signUpHref = canonicalAuthUrl("sign-up", portal, portal === "creator" ? "/creator" : "/app");
  return <div className="marketing-page"><div className="subpage-header"><MarketingHeader /></div><main>
    <section className="solution-hero"><div className="marketing-container solution-hero-grid"><div><span className="eyebrow-pill"><Sparkle weight="fill" /> {solution.audience}</span><h1>{solution.title}<br /><em>{solution.accent}</em></h1><p>{solution.description}</p><div className="hero-actions"><Link className="button button-light button-large" href={signUpHref}>Start with PRIFYN <ArrowRight /></Link><Link className="button button-ghost-light button-large" href="/case-studies">See operating studies</Link></div><div className="solution-proof">{solution.proof.map(item => <span key={item}><CheckCircle weight="fill" />{item}</span>)}</div></div><div className="solution-decision-card"><span>Next best decision</span><h2>{solution.outcome}</h2><div><small>Why</small><p>Campaign evidence, delivery readiness, and business impact point to the same priority.</p></div><div><small>Confidence</small><strong>High · 4 verified signals</strong></div><button type="button">Review evidence <ArrowRight /></button></div></div></section>
    <section className="section section-paper"><div className="marketing-container intro-grid"><div><span className="section-kicker">The operating challenge</span><h2>{solution.problemTitle}</h2></div><p className="solution-intro">PRIFYN connects the work, evidence, and ownership required to make the next decision—without forcing your team into an oversized system.</p></div><div className="marketing-container problem-grid">{solution.problems.map(item => <article className="problem-card" key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div></section>
    <section className="section section-sage"><div className="marketing-container centered-heading"><span className="section-kicker">One working rhythm</span><h2>From scattered activity<br />to accountable growth.</h2></div><div className="marketing-container solution-workflow">{solution.workflow.map((item, index) => <article key={item.label}><span>{item.label}</span><b>0{index + 1}</b><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div></section>
    <section className="final-cta"><div className="marketing-container final-cta-inner"><span className="section-kicker light">Built around your workflow</span><h2>Less time coordinating.<br /><em>More confidence growing.</em></h2><p>Start with one real campaign and prove the operating rhythm.</p><Link className="button button-light button-large" href={signUpHref}>Create your workspace <ArrowRight /></Link></div></section>
  </main><MarketingFooter /></div>;
}
