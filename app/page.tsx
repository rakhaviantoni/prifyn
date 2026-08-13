import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  CursorClick,
  Database,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { GrowthBento } from "@/components/growth-bento";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { ProductPreview } from "@/components/product-preview";

export default function LandingPage() {
  return (
    <div className="marketing-page">
      <MarketingHeader />
      <main>
        <section className="hero-section">
          <div className="hero-glow" />
          <div className="marketing-container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow-pill"><Sparkle weight="fill" /> AI-native Growth Operating System</div>
              <h1>Know what moves<br />your business <em>next.</em></h1>
              <p className="hero-lede">PRIFYN connects campaigns, creators, revenue, and operating signals—then turns the evidence into the next best decision.</p>
              <div className="hero-actions">
                <Link className="button button-light button-large" href="/book">Book appointment <ArrowRight weight="bold" /></Link>
                <Link className="button button-ghost-light button-large" href="/apply">Apply online</Link>
              </div>
              <div className="hero-proof">
                <span><CheckCircle weight="fill" /> No credit card</span>
                <span><CheckCircle weight="fill" /> Guided setup</span>
                <span><CheckCircle weight="fill" /> Your data stays yours</span>
              </div>
            </div>
            <ProductPreview />
          </div>
          <div className="hero-marquee" aria-label="Core capabilities">
            <div className="marketing-container marquee-row">
              <span>Campaign intelligence</span><i />
              <span>Creator operations</span><i />
              <span>Revenue attribution</span><i />
              <span>Explainable AI</span><i />
              <span>Decision workflows</span>
            </div>
          </div>
        </section>

        <section className="section section-paper">
          <div className="marketing-container intro-grid">
            <div>
              <span className="section-kicker">The operating gap</span>
              <h2>Growth creates complexity.<br /><em>PRIFYN creates clarity.</em></h2>
            </div>
            <div className="intro-copy">
              <p>Growing businesses and multi-brand teams can create demand. The real constraint appears after the campaign works: disconnected data, overloaded teams, uncertain attribution, and decisions made too late.</p>
              <Link href="/docs" className="text-link">Read the Growth OS docs <ArrowRight weight="bold" /></Link>
            </div>
          </div>
          <div className="marketing-container problem-grid">
            <ProblemCard number="01" title="Work is scattered" text="Briefs, creator conversations, deadlines, and results live in different tools." />
            <ProblemCard number="02" title="Performance lacks context" text="A chart says revenue changed. It rarely explains why or what to do next." />
            <ProblemCard number="03" title="Decisions arrive late" text="Teams discover delivery and budget problems after there is time to fix them." />
          </div>
        </section>

        <section className="section section-sage">
          <div className="marketing-container centered-heading">
            <span className="section-kicker">One operating rhythm</span>
            <h2>From signal to decision<br />in one connected system.</h2>
            <p>Everything in PRIFYN is designed around a simple question: what should the team do next?</p>
          </div>
          <GrowthBento />
        </section>

        <section className="section section-dark decision-section">
          <div className="marketing-container decision-grid">
            <div className="decision-copy">
              <span className="section-kicker light">Explainable intelligence</span>
              <h2>AI recommendations<br />you can actually trust.</h2>
              <p>PRIFYN never hides the reasoning. Every recommendation shows what changed, the evidence used, how confident the system is, and the action it recommends.</p>
              <div className="trust-list">
                <span><ShieldCheck /> Permission-aware by design</span>
                <span><Database /> Grounded in governed business metrics</span>
                <span><CursorClick /> Human confirmation before every action</span>
              </div>
            </div>
            <div className="insight-demo">
              <div className="insight-demo-head"><span><Sparkle weight="fill" /> Campaign diagnosis</span><b>High confidence</b></div>
              <p className="insight-question">Why did Lunch Box Launch ROAS decline?</p>
              <div className="insight-answer">
                <span>Diagnosis</span>
                <strong>Paid amplification cost rose 24% while creator-led conversion remained stable.</strong>
                <p>The decline is cost-driven, not a content or creator-quality issue.</p>
              </div>
              <div className="evidence-row"><span>Evidence</span><b>3 sources</b><b>Updated 12 min ago</b></div>
              <div className="recommended-row"><CheckCircle weight="fill" /><div><span>Recommended action</span><strong>Reduce paid amplification by 15% for 7 days and preserve creator mix.</strong></div></div>
            </div>
          </div>
        </section>

        <section className="section section-paper">
          <div className="marketing-container outcome-grid">
            <div className="outcome-quote">
              <span className="section-kicker">Built for growing operators</span>
              <blockquote>“People don’t buy dashboards. They buy better decisions.”</blockquote>
              <p>PRIFYN is built for owners and growth teams who need confidence before they increase demand—not another place to look at charts.</p>
            </div>
            <div className="outcome-stats">
              <div><strong>&lt;15 min</strong><span>Target weekly review time</span></div>
              <div><strong>1 source</strong><span>For campaign decisions</span></div>
              <div><strong>100%</strong><span>Recommendations with evidence</span></div>
              <div><strong>0</strong><span>Black-box actions</span></div>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="marketing-container final-cta-inner">
            <span className="section-kicker light">Grow with confidence</span>
            <h2>Your business already has the signals.<br /><em>PRIFYN makes them useful.</em></h2>
            <p>Build a calmer, more accountable growth operation from your next campaign onward.</p>
            <div className="hero-actions centered-actions">
              <Link className="button button-light button-large" href="/book">Book walkthrough <ArrowRight weight="bold" /></Link>
              <Link className="button button-ghost-light button-large" href="/docs">Read docs</Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function ProblemCard({ number, title, text }: { number: string; title: string; text: string }) {
  return <article className="problem-card"><span>{number}</span><h3>{title}</h3><p>{text}</p></article>;
}
