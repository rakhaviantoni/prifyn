import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "@phosphor-icons/react/dist/ssr";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { blogPosts } from "@/lib/resources-data";
export function generateStaticParams() { return blogPosts.map(post => ({ slug: post.slug })); }
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const post = blogPosts.find(item => item.slug === slug); if (!post) notFound(); return <div className="marketing-page"><div className="subpage-header"><MarketingHeader /></div><main><article className="article-page"><header><div className="marketing-container article-head"><Link href="/blog"><ArrowLeft /> Back to journal</Link><span className="section-kicker">{post.category}</span><h1>{post.title}</h1><p>{post.excerpt}</p><small>{post.date} · <Clock /> {post.read}</small></div></header><div className="marketing-container article-body">{post.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}<aside><strong>The operating takeaway</strong><p>A useful growth system should help a team make a decision—not simply add another dashboard to review.</p></aside></div></article></main><MarketingFooter /></div>; }
