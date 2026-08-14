import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "@phosphor-icons/react/dist/ssr";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { blogPosts } from "@/lib/resources-data";

export const metadata: Metadata = { title: "Blog", description: "Practical thinking about growth operations, creator intelligence, and evidence-led decisions." };

const indonesiaPosts = blogPosts.filter(post => post.market === "Indonesia");
const globalPosts = blogPosts.filter(post => post.market === "Global");

function ArticleCard({ post, featured = false }: { post: (typeof blogPosts)[number]; featured?: boolean }) {
  return (
    <article className={`resource-card ${featured ? "featured" : ""}`}>
      <div className={`resource-art resource-art-${post.image}`}>
        <span>{post.category}</span>
        <b>{post.market}</b>
      </div>
      <div className="resource-card-copy">
        <span><small className="market-badge">{post.market}</small>{post.date} <i /> <Clock /> {post.read}</span>
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`}>Read article <ArrowRight /></Link>
      </div>
    </article>
  );
}

export default function BlogPage() {
  return (
    <div className="marketing-page">
      <div className="subpage-header"><MarketingHeader /></div>
      <main>
        <section className="resource-hero">
          <div className="marketing-container">
            <span className="section-kicker">PRIFYN Journal</span>
            <h1>Better growth starts<br /><em>with better questions.</em></h1>
            <p>Practical thinking for Indonesian operators and global growth teams building more accountable ways to plan, execute, measure, understand, and improve.</p>
          </div>
        </section>
        <section className="section section-paper">
          <div className="marketing-container blog-market-section">
            <div className="blog-market-head">
              <span className="section-kicker">Indonesia field notes</span>
              <h2>Marketplaces, WhatsApp, creators, live commerce, and manual reports.</h2>
              <p>Local realities need workflows that accept exports, screenshots, WhatsApp leads, affiliate codes, and owner-led operating decisions.</p>
            </div>
            <div className="resource-grid">
              {indonesiaPosts.map((post, index) => <ArticleCard key={post.slug} post={post} featured={index === 0} />)}
            </div>
          </div>
          <div className="marketing-container blog-market-section">
            <div className="blog-market-head">
              <span className="section-kicker">Global operating principles</span>
              <h2>Decision systems for teams that already have too many tools.</h2>
              <p>Patterns for connecting paid media, creator work, CRM signals, attribution, and AI recommendations into one operating rhythm.</p>
            </div>
            <div className="resource-grid">
              {globalPosts.map((post, index) => <ArticleCard key={post.slug} post={post} featured={index === 0} />)}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
