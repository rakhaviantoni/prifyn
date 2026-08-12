import Link from "next/link";
import { Bank, Clock, CurrencyCircleDollar, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

export default function CreatorPaymentsPage() {
  return <div className="app-content">
    <header className="app-page-head"><div><span>Earnings & payouts</span><h1>Payments</h1><p>Payment milestones will appear after a brand campaign is approved and connected to your creator workroom.</p></div><button className="button button-outline" type="button" disabled><Bank /> Payout account</button></header>
    <section className="payment-kpis"><article className="surface"><CurrencyCircleDollar /><span><small>Approved earnings</small><strong>Rp0</strong></span></article><article className="surface"><Clock /><span><small>Pending approval</small><strong>Rp0</strong></span></article><article className="surface"><ShieldCheck /><span><small>Payout status</small><strong>Not set</strong></span></article></section>
    <section className="surface empty-state creator-empty-state"><CurrencyCircleDollar weight="duotone" /><h2>No payment milestones yet</h2><p>Once a brand approves your proposal, PRIFYN will track agreement status, content approval, proof, and payout milestones here.</p><div className="empty-actions"><Link className="button button-dark" href="/creator/opportunities">Find campaigns</Link><Link className="button button-outline" href="/creator/campaigns">Open workrooms</Link></div></section>
    <section className="payment-disclosure surface"><ShieldCheck weight="duotone" /><p><strong>No hidden escrow claim.</strong> PRIFYN records agreement, approval, and payout status. Holding or moving funds only activates through a licensed payment partner.</p></section>
  </div>;
}
