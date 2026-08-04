import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "@phosphor-icons/react/dist/ssr";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { blogPosts } from "@/lib/resources-data";
export const metadata: Metadata = { title: "Blog", description: "Practical thinking about growth operations, creator intelligence, and evidence-led decisions." };
export default function BlogPage() { return <div className="marketing-page"><div className="subpage-header"><MarketingHeader /></div><main><section className="resource-hero"><div className="marketing-container"><span className="section-kicker">PRIFYN Journal</span><h1>Better growth starts<br /><em>with better questions.</em></h1><p>Practical thinking for owners, growth teams, agencies, and creators building more accountable ways to work.</p></div></section><section className="section section-paper"><div className="marketing-container resource-grid">{blogPosts.map((post, index) => <article className={`resource-card ${index === 0 ? "featured" : ""}`} key={post.slug}><div className={`resource-art resource-art-${index + 1}`}><span>{post.category}</span><b>0{index + 1}</b></div><div className="resource-card-copy"><span>{post.date} <i /> <Clock /> {post.read}</span><h2>{post.title}</h2><p>{post.excerpt}</p><Link href={`/blog/${post.slug}`}>Read article <ArrowRight /></Link></div></article>)}</div></section></main><MarketingFooter /></div>; }
