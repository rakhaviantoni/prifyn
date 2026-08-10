"use client";

import Link from "next/link";
import { ArrowRight, Buildings, CheckCircle, LinkSimple, Sparkle } from "@phosphor-icons/react";
import { useState } from "react";

const plans = [
  { name: "Starter", detail: "For one brand proving a repeatable growth workflow.", monthly: 690000, features: ["1 operating brand", "3 active campaigns", "5 team members", "CSV ads import", "Weekly decision report"] },
  { name: "Growth", detail: "For teams operating multiple brands and always-on campaigns.", monthly: 1490000, featured: true, features: ["3 operating brands", "Unlimited campaigns", "15 team members", "Attribution and AI diagnosis", "Monthly executive review"] },
  { name: "Scale", detail: "For multi-brand groups and agencies needing governance.", monthly: 3290000, features: ["10 operating brands", "Unlimited team members", "Advanced permissions", "Priority data onboarding", "Dedicated success reviews"] },
];

const format = (value: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);

export function PricingTable() {
  const [annual, setAnnual] = useState(true);
  return <section className="section section-paper"><div className="marketing-container"><div className="billing-toggle" style={{ marginTop: -140, position: "relative", zIndex: 2, marginBottom: 94 }}><button className={!annual ? "active" : ""} onClick={() => setAnnual(false)}>Monthly</button><button className={annual ? "active" : ""} onClick={() => setAnnual(true)}>Annual <b>Save 20%</b></button></div><div className="pricing-grid">{plans.map(plan => { const value = annual ? Math.round(plan.monthly * .8) : plan.monthly; return <article className={`price-card ${plan.featured ? "featured" : ""}`} key={plan.name}>{plan.featured && <span className="popular-label">Most popular</span>}<span>{plan.name}</span><h2>{plan.name === "Growth" ? "Build the growth engine" : plan.name === "Starter" ? "Establish the rhythm" : "Operate across brands"}</h2><p>{plan.detail}</p><div className="price"><strong>Rp {format(value)}</strong><small>/ month</small></div><div className="price-features">{plan.features.map(feature => <span key={feature}><CheckCircle weight="fill" />{feature}</span>)}</div><Link className={`button ${plan.featured ? "button-dark" : "button-outline"}`} href={`/auth/sign-up?plan=${plan.name.toLowerCase()}`}>{plan.name === "Scale" ? "Talk to us" : `Start ${plan.name}`} <ArrowRight /></Link></article>; })}</div><div className="pricing-model"><article><Buildings weight="duotone" /><div><strong>Pay for operating capacity</strong><p>Your plan includes 1, 3, or 10 brands. Additional brand slots start at Rp350.000/month.</p></div></article><article><LinkSimple weight="duotone" /><div><strong>Connect accounts freely</strong><p>Eligible Meta, Google, TikTok, Tokopedia, and Shopee accounts are not charged as extra seats.</p></div></article><article><Sparkle weight="duotone" /><div><strong>AI usage stays visible</strong><p>Every plan includes AI actions. Paid overage remains off until the workspace owner approves it.</p></div></article></div><p className="pricing-note">Plans are priced per workspace and include the listed operating brands. Managed onboarding and custom data work are quoted separately. Prices remain founding-customer proposals until commercial validation.</p></div></section>;
}
