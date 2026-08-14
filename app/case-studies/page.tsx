import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Buildings, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { caseStudies } from "@/lib/resources-data";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Interview-based operating studies showing how PRIFYN turns growth signals into accountable decisions.",
};

export default function CaseStudiesPage() {
  return (
    <div className="marketing-page">
      <div className="subpage-header"><MarketingHeader /></div>
      <main>
        <section className="resource-hero case-hero">
          <div className="marketing-container">
            <span className="section-kicker">Real interviews</span>
            <h1>See the decision,<br /><em>not just the dashboard.</em></h1>
            <p>Field notes from Indonesian businesses where growth created real operating pressure: creator demand, marketplace ads, stock truth, staffing, margin, and reporting discipline.</p>
          </div>
        </section>
        <section className="section section-paper">
          <div className="marketing-container case-grid">
            {caseStudies.map(study => (
              <article className="case-card surface" key={study.slug}>
                <div className={`case-art case-art-${study.image}`}>
                  <Buildings weight="duotone" />
                  <span>{study.industry}</span>
                </div>
                <div>
                  <span className="case-label"><CheckCircle weight="fill" />{study.label}</span>
                  <h2>{study.title}</h2>
                  <p>{study.summary}</p>
                  <a className="source-chip" href={study.sourceUrl} target="_blank" rel="noreferrer">{study.sourceLabel}</a>
                  <div className="case-outcomes">{study.outcome.slice(0, 3).map(item => <span key={item}>{item}</span>)}</div>
                  <Link className="text-link" href={`/case-studies/${study.slug}`}>Read operating study <ArrowRight /></Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
