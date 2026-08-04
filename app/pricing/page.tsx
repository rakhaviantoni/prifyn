import type { Metadata } from "next";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { PricingTable } from "@/components/pricing-table";

export const metadata: Metadata = { title: "Pricing", description: "Simple Growth OS pricing for SME teams." };

export default function PricingPage() {
  return <div className="marketing-page"><div className="subpage-header"><MarketingHeader /></div><main><section className="page-hero compact"><div className="marketing-container"><span className="section-kicker">Simple, deliberate pricing</span><h1>Start with decisions.<br />Scale with your operation.</h1><p>No feature maze. Choose the operating depth your team needs today, then expand when the business earns the complexity.</p></div></section><PricingTable /><section className="final-cta"><div className="marketing-container final-cta-inner"><span className="section-kicker light">Not sure where to start?</span><h2>Begin with one campaign.<br /><em>Prove the operating rhythm.</em></h2><p>Every plan includes guided onboarding and a complete data export.</p></div></section></main><MarketingFooter /></div>;
}
