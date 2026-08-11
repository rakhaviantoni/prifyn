"use client";

import { useState } from "react";
import { Bank, CheckCircle, Clock, CurrencyCircleDollar, ShieldCheck } from "@phosphor-icons/react";
import { getCreatorBrief } from "@/lib/creator-campaign-data";

export default function CreatorPaymentsPage() {
  const brief = getCreatorBrief("ramadan-made-simple");
  const [notice, setNotice] = useState<string | null>(null);
  const approved = brief.paymentMilestones.filter(item => item.status === "Approved");
  const pending = brief.paymentMilestones.filter(item => item.status !== "Approved");
  const notify = (value: string) => {
    setNotice(value);
    window.setTimeout(() => setNotice(null), 2600);
  };

  return <div className="app-content"><header className="app-page-head"><div><span>Earnings & payouts</span><h1>Payments</h1><p>Payment milestones are connected to brand agreement, content approval, and proof submission status.</p></div><button className="button button-outline" type="button" onClick={() => notify("Payout account form opened. Production payout movement needs a licensed payment partner.")}><Bank /> Payout account</button></header><section className="payment-kpis"><article className="surface"><CurrencyCircleDollar /><span><small>Approved earnings</small><strong>{approved[0]?.amount ?? "Rp0"}</strong></span></article><article className="surface"><Clock /><span><small>Pending approval</small><strong>{pending[0]?.amount ?? "Rp0"}</strong></span></article><article className="surface"><CheckCircle /><span><small>Connected campaign</small><strong>{brief.title}</strong></span></article></section><section className="surface table-wrap"><div className="surface-head"><h2>Payment milestones</h2><span>Brand agreement · {brief.approvedVersion}</span></div><table className="data-table"><thead><tr><th>Campaign</th><th>Milestone</th><th>Amount</th><th>Expected</th><th>Status</th></tr></thead><tbody>{brief.paymentMilestones.map(item => <tr key={item.label}><td><strong>{brief.title}</strong><small>{brief.brand}</small></td><td>{item.label}</td><td>{item.amount}</td><td>{item.expected}</td><td><span className={`status-pill ${item.status === "Approved" ? "" : "neutral"}`}>{item.status}</span></td></tr>)}</tbody></table></section><section className="payment-disclosure surface"><ShieldCheck weight="duotone" /><p><strong>No hidden escrow claim.</strong> PRIFYN records agreement, approval, and payout status today. Holding or moving funds only activates through a licensed payment partner.</p></section>{notice && <div className="toast"><CheckCircle weight="fill" />{notice}</div>}</div>;
}
