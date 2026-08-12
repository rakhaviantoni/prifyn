"use client";

import { ArrowRight, Buildings, Check, CheckCircle, CreditCard, DownloadSimple, Gauge, Plus, Sparkle, X } from "@phosphor-icons/react";
import { useState } from "react";

type Tab = "Overview" | "Usage" | "Invoices";
const plans = [
  { name: "Starter", price: "Rp690.000", brands: 1, members: "5", ai: "2.000 AI actions" },
  { name: "Growth", price: "Rp1.490.000", brands: 3, members: "15", ai: "10.000 AI actions" },
  { name: "Scale", price: "Rp3.290.000", brands: 10, members: "Unlimited", ai: "50.000 AI actions" },
];
const invoices = [
  { number: "INV-2026-008", date: "1 Aug 2026", period: "1–31 Aug 2026", amount: "Rp1.653.900", status: "Paid" },
  { number: "INV-2026-007", date: "1 Jul 2026", period: "1–31 Jul 2026", amount: "Rp1.653.900", status: "Paid" },
  { number: "INV-2026-006", date: "1 Jun 2026", period: "1–30 Jun 2026", amount: "Rp1.653.900", status: "Paid" },
];

export function BillingCenter() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [planDialog, setPlanDialog] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const notify = (value: string) => { setNotice(value); window.setTimeout(() => setNotice(null), 2400); };
  const downloadInvoice = (invoice: (typeof invoices)[number]) => {
    const body = `PRIFYN\nInvoice,${invoice.number}\nDate,${invoice.date}\nBilling period,${invoice.period}\nPlan,Growth\nWorkspace,Current workspace\nSubtotal,Rp1.490.000\nTax 11%,Rp163.900\nTotal,${invoice.amount}\nStatus,${invoice.status}\n`;
    const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${invoice.number}.csv`; anchor.click(); URL.revokeObjectURL(url);
    notify(`${invoice.number} downloaded.`);
  };

  return <div className="app-content billing-page"><header className="app-page-head"><div><span>Workspace billing</span><h1>Billing & usage</h1><p>One workspace subscription, included brand capacity, and transparent usage.</p></div><span className="status-pill"><CheckCircle weight="fill" /> Growth plan</span></header><div className="page-tabs billing-tabs" role="tablist">{(["Overview", "Usage", "Invoices"] as Tab[]).map(item => <button type="button" role="tab" aria-selected={tab === item} className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item}</button>)}</div>
    {tab === "Overview" && <div className="billing-overview"><section className="surface billing-plan-card"><div><span className="section-kicker">Current plan</span><h2>Growth</h2><p>For teams operating multiple brands and always-on campaigns.</p></div><div className="billing-price"><strong>Rp1.490.000</strong><small>/ month · billed monthly</small></div><div className="billing-entitlements"><span><Check /> 3 operating brands</span><span><Check /> 15 team members</span><span><Check /> Unlimited campaigns</span><span><Check /> 10.000 included AI actions</span></div><button type="button" className="button button-outline" onClick={() => setPlanDialog(true)}>Compare plans <ArrowRight /></button></section><section className="surface billing-summary"><div className="surface-head"><h2>Next invoice</h2><span>1 Sep 2026</span></div><div className="invoice-breakdown"><div><span>Growth workspace plan</span><strong>Rp1.490.000</strong></div><div><span>Additional operating brands</span><strong>Rp0</strong></div><div><span>AI usage overage</span><strong>Rp0</strong></div><div><span>Tax estimate · 11%</span><strong>Rp163.900</strong></div><div className="total"><span>Estimated total</span><strong>Rp1.653.900</strong></div></div><small>Connected ad accounts are never billed separately. One brand can connect multiple eligible accounts per provider.</small></section></div>}
    {tab === "Usage" && <><section className="billing-usage-grid"><Usage icon={Buildings} label="Operating brands" value="3 / 3" progress={100} note="Limit reached · upgrade or add a brand slot" /><Usage icon={Gauge} label="Team members" value="4 / 15" progress={27} note="11 seats available" /><Usage icon={Sparkle} label="AI actions" value="6.240 / 10.000" progress={62} note="Resets 1 September" /></section><section className="surface add-on-card"><div><Plus /><span><strong>Need another operating brand?</strong><small>Add one brand slot for Rp350.000/month, or move to Scale when you need four or more additional brands.</small></span></div><button type="button" className="button button-dark" onClick={() => notify("Brand add-on request prepared for workspace owner approval.")}>Request brand add-on</button></section><section className="surface usage-policy"><CreditCard weight="duotone" /><div><h2>How billing works</h2><p>The workspace plan includes brand capacity and team access. Provider accounts are connections—not billable seats. AI overage is metered separately and must be approved before paid usage starts.</p></div></section></>}
    {tab === "Invoices" && <section className="surface table-wrap"><div className="surface-head"><h2>Invoice history</h2><span>Amounts include estimated tax</span></div><table className="data-table invoice-table"><thead><tr><th>Invoice</th><th>Date</th><th>Billing period</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead><tbody>{invoices.map(invoice => <tr key={invoice.number}><td><strong>{invoice.number}</strong></td><td>{invoice.date}</td><td>{invoice.period}</td><td>{invoice.amount}</td><td><span className="status-pill"><CheckCircle weight="fill" /> {invoice.status}</span></td><td><button type="button" className="table-action" onClick={() => downloadInvoice(invoice)}><DownloadSimple /> Download</button></td></tr>)}</tbody></table></section>}
    {planDialog && <div className="dialog-backdrop" onMouseDown={() => setPlanDialog(false)}><section className="dialog-card billing-dialog" role="dialog" aria-modal="true" aria-labelledby="plans-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setPlanDialog(false)}><X /></button><span className="section-kicker">Workspace plans</span><h2 id="plans-title">Choose capacity, not account count.</h2><p>All plans let each included brand connect multiple eligible provider accounts.</p><div className="billing-plan-options">{plans.map(plan => <article className={plan.name === "Growth" ? "selected" : ""} key={plan.name}><span>{plan.name}</span><strong>{plan.price}<small>/month</small></strong><p>{plan.brands} operating {plan.brands === 1 ? "brand" : "brands"} · {plan.members} members · {plan.ai}</p><button type="button" className={`button ${plan.name === "Growth" ? "button-soft" : "button-outline"}`} onClick={() => plan.name === "Growth" ? setPlanDialog(false) : notify(`${plan.name} plan change requires owner confirmation.`)}>{plan.name === "Growth" ? "Current plan" : `Choose ${plan.name}`}</button></article>)}</div></section></div>}{notice && <div className="toast" role="status"><CheckCircle weight="fill" />{notice}</div>}
  </div>;
}

function Usage({ icon: Icon, label, value, progress, note }: { icon: typeof Buildings; label: string; value: string; progress: number; note: string }) { return <article className="surface billing-usage"><span><Icon weight="duotone" /></span><div><small>{label}</small><strong>{value}</strong></div><i><b style={{ width: `${progress}%` }} /></i><p>{note}</p></article>; }
