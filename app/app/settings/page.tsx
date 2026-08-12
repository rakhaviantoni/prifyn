"use client";

import { Bell, Buildings, ChartLineUp, CheckCircle, CreditCard, PlugsConnected, ShieldCheck, UsersThree } from "@phosphor-icons/react";
import { useState } from "react";
import { WorkspaceLink } from "@/components/workspace-link";

const settings = [
  { icon: Buildings, title: "Operating brands", copy: "Set up brand profiles, switch the active brand, and keep campaign/import/report data scoped correctly.", status: "Brand-scoped", tone: "" },
  { icon: PlugsConnected, title: "Connections", copy: "Authorize channels once, assign external accounts to operating brands, and monitor permissions and sync health.", status: "2 active sources", tone: "" },
  { icon: UsersThree, title: "Team & access", copy: "Invite teammates, assign workspace roles, and keep sensitive decisions with the right people.", status: "4 members", tone: "" },
  { icon: CreditCard, title: "Billing & usage", copy: "Manage the workspace plan, operating-brand capacity, AI usage, invoices, and receipts.", status: "Growth · 3 brands", tone: "" },
  { icon: ChartLineUp, title: "Data readiness", copy: "Review source coverage and freshness before PRIFYN uses evidence in a recommendation.", status: "86% ready", tone: "" },
  { icon: ShieldCheck, title: "AI recommendations", copy: "Require visible evidence, confidence, and human confirmation before any action is recorded.", status: "Human review on", tone: "" },
  { icon: Bell, title: "Decision notifications", copy: "Choose which risks, approvals, and weekly reviews should reach your team.", status: "3 rules active", tone: "neutral" },
];

export default function SettingsPage() {
  const [active, setActive] = useState<string | null>(null);
  return <div className="app-content"><header className="app-page-head"><div><span>Workspace governance</span><h1>Settings</h1><p>Shape how your team works, reviews evidence, and receives decisions.</p></div></header><div className="settings-grid">{settings.map(({ icon: Icon, title, copy, status, tone }) => <section className={`surface settings-card ${active === title ? "selected" : ""}`} key={title}><span className="settings-icon"><Icon weight="duotone" /></span><div><h2>{title}</h2><p>{copy}</p>{active === title && <p className="settings-confirmation" role="status">{title === "Operating brands" ? "Open the brand dropdown in the sidebar, choose Edit brand profile, then save. The active brand controls campaigns, imports, reports, and connections." : "This control is ready. Changes will become editable when your workspace is connected."}</p>}</div><span className={`status-pill ${tone}`}><CheckCircle weight="fill" /> {status}</span>{title === "Connections" ? <WorkspaceLink className="button button-outline" href="/app/settings/connections">Manage</WorkspaceLink> : title === "Team & access" ? <WorkspaceLink className="button button-outline" href="/app/settings/team">Manage</WorkspaceLink> : title === "Billing & usage" ? <WorkspaceLink className="button button-outline" href="/app/settings/billing">Manage</WorkspaceLink> : <button className="button button-outline" type="button" aria-expanded={active === title} onClick={() => setActive(active === title ? null : title)}>{active === title ? "Close" : "Manage"}</button>}</section>)}</div></div>;
}
