"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { useState } from "react";

const plans = [
  { name: "Starter", detail: "For a small team proving its first repeatable growth workflow.", monthly: 690000, features: ["3 active campaigns", "5 team members", "50 creator profiles", "CSV ads import", "Weekly decision report"] },
  { name: "Growth", detail: "For teams running an always-on creator and campaign operation.", monthly: 1490000, featured: true, features: ["Unlimited campaigns", "15 team members", "500 creator profiles", "Attribution and AI diagnosis", "Monthly executive review"] },
  { name: "Scale", detail: "For multi-brand operators needing governance and deeper support.", monthly: 3290000, features: ["3 organizations", "Unlimited team members", "Advanced permissions", "Priority data onboarding", "Dedicated success reviews"] },
];

const format = (value: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);

export function PricingTable() {
  const [annual, setAnnual] = useState(true);
  return <section className="section section-paper"><div className="marketing-container"><div className="billing-toggle" style={{ marginTop: -140, position: "relative", zIndex: 2, marginBottom: 94 }}><button className={!annual ? "active" : ""} onClick={() => setAnnual(false)}>Monthly</button><button className={annual ? "active" : ""} onClick={() => setAnnual(true)}>Annual <b>Save 20%</b></button></div><div className="pricing-grid">{plans.map(plan => { const value = annual ? Math.round(plan.monthly * .8) : plan.monthly; return <article className={`price-card ${plan.featured ? "featured" : ""}`} key={plan.name}>{plan.featured && <span className="popular-label">Most popular</span>}<span>{plan.name}</span><h2>{plan.name === "Growth" ? "Build the growth engine" : plan.name === "Starter" ? "Establish the rhythm" : "Operate across brands"}</h2><p>{plan.detail}</p><div className="price"><strong>Rp {format(value)}</strong><small>/ month</small></div><div className="price-features">{plan.features.map(feature => <span key={feature}><CheckCircle weight="fill" />{feature}</span>)}</div><Link className={`button ${plan.featured ? "button-dark" : "button-outline"}`} href={`/auth/sign-up?plan=${plan.name.toLowerCase()}`}>{plan.name === "Scale" ? "Talk to us" : `Start ${plan.name}`} <ArrowRight /></Link></article>; })}</div><p className="pricing-note">Prices exclude applicable tax. Annual plans are billed once per year. Founding-customer pricing is subject to validation before commercial launch.</p></div></section>;
}
