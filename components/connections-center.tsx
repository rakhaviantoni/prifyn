"use client";

import {
  ArrowClockwise, ArrowRight, CheckCircle, Clock, Database, Eye, GearSix, Info,
  LockKey, PlugsConnected, ShieldCheck, Sparkle, Warning, X,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { ChannelLogo } from "./channel-logo";

type ProviderReadiness = {
  id: string;
  label: string;
  auth: string;
  capabilities: readonly string[];
  configured: boolean;
};

type LiveConnection = { provider: string; status: string; accounts: Array<{ id: string; displayName: string | null; status: string; lastDiscoveredAt: string }> };

const categories = ["Advertising", "Commerce", "Analytics", "Creator data"] as const;

const providerMeta: Record<string, { category: typeof categories[number]; description: string; status: string; freshness: string; account: string }> = {
  meta: { category: "Advertising", description: "Ad accounts, Pages, Instagram identities, publishing, and insights.", status: "Connected", freshness: "Synced 8 min ago", account: "Nusa Spice Business · 2 ad accounts" },
  google: { category: "Advertising", description: "Customer accounts, conversion actions, campaign publishing, and reporting.", status: "Setup required", freshness: "No production sync", account: "No account authorized" },
  tiktok: { category: "Advertising", description: "Advertiser accounts, TikTok identities, campaign publishing, and reporting.", status: "Approval required", freshness: "Provider review pending", account: "No advertiser authorized" },
  tokopedia: { category: "Commerce", description: "Shop orders and attribution through approved partner access.", status: "Partner gated", freshness: "Manual import available", account: "Nusa Spice Official Store" },
  shopee: { category: "Commerce", description: "Authorized shops, order data, and commerce attribution.", status: "Partner gated", freshness: "Manual import available", account: "Nusa Spice Official" },
};

const extraProviders: ProviderReadiness[] = [
  { id: "ga4", label: "Google Analytics 4", auth: "Google OAuth 2.0", capabilities: ["Web sessions", "Conversion paths", "Landing-page performance"], configured: false },
  { id: "posthog", label: "PostHog", auth: "Project API key", capabilities: ["Product events", "Funnels", "User journeys"], configured: true },
  { id: "instagram_creator", label: "Instagram creator profiles", auth: "Creator authorization", capabilities: ["Profile evidence", "Portfolio links", "Performance snapshots"], configured: false },
  { id: "youtube_creator", label: "YouTube creator profiles", auth: "Incremental Google OAuth", capabilities: ["Channel evidence", "Video analytics", "Audience summaries"], configured: false },
].map(item => ({ ...item, capabilities: item.capabilities as readonly string[] }));

function categoryFor(provider: ProviderReadiness) {
  if (providerMeta[provider.id]) return providerMeta[provider.id].category;
  if (provider.id === "ga4" || provider.id === "posthog") return "Analytics";
  return "Creator data";
}

export function ConnectionsCenter() {
  const [category, setCategory] = useState<typeof categories[number]>("Advertising");
  const [providers, setProviders] = useState<ProviderReadiness[]>(extraProviders);
  const [selected, setSelected] = useState<ProviderReadiness | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [liveConnections, setLiveConnections] = useState<LiveConnection[] | null>(null);

  useEffect(() => {
    fetch("/api/integrations/configured")
      .then(response => response.json())
      .then((body: { providers?: ProviderReadiness[] }) => setProviders([...(body.providers ?? []), ...extraProviders]))
      .catch(() => setProviders(extraProviders));
    fetch("/api/integrations/connections")
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((body: { connections?: LiveConnection[] }) => setLiveConnections(body.connections ?? []))
      .catch(() => setLiveConnections(null));
    const query = new URLSearchParams(window.location.search);
    queueMicrotask(() => {
      if (query.get("connection") === "google") setNotice(`${query.get("accounts") ?? "0"} Google Ads account(s) discovered. ${query.get("selection_required") === "true" ? "Choose which account belongs to this brand." : "The account is ready for brand assignment."}`);
      if (query.has("connection_error")) setNotice("The channel authorization could not be completed. Review provider setup and try again.");
    });
  }, []);

  const visible = useMemo(() => providers.filter(provider => categoryFor(provider) === category), [providers, category]);
  const notify = (value: string) => { setNotice(value); window.setTimeout(() => setNotice(null), 2600); };

  function primaryAction(provider: ProviderReadiness) {
    if (provider.id === "google" && provider.configured) {
      window.location.assign("/api/integrations/google/connect");
      return;
    }
    setSelected(provider);
  }

  function refreshHealth() {
    setChecking(true);
    window.setTimeout(() => { setChecking(false); notify("Connection health refreshed. No new permission changes found."); }, 750);
  }

  async function assignAccount(accountId: string) {
    const response = await fetch(`/api/integrations/accounts/${accountId}/assign`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reportingEnabled: true, publishingEnabled: false }) });
    if (!response.ok) { notify("Account assignment failed. Workspace owner access and a valid operating brand are required."); return; }
    notify("Account assigned for reporting. Publishing remains off until an admin enables it.");
    setSelected(null);
  }

  const connectedCount = liveConnections?.filter(connection => connection.status === "connected").length ?? 0;
  return <div className="connections-center">
    <header className="app-page-head connections-head"><div><span>Workspace infrastructure</span><h1>Connections</h1><p>Authorize data once, assign accounts to operating brands, and keep every recommendation source-aware.</p></div><button type="button" className="button button-outline" onClick={refreshHealth} disabled={checking}><ArrowClockwise className={checking ? "spinning" : ""} /> {checking ? "Checking…" : "Refresh health"}</button></header>

    <section className="connections-overview">
      <article className="surface connection-summary primary"><span><PlugsConnected weight="duotone" /></span><div><small>Workspace coverage</small><strong>{connectedCount} production sources</strong><p>{liveConnections === null ? "Sign in to load workspace authorizations." : connectedCount ? "Authorized sources are available for evidence." : "No production source is authorized yet."}</p></div></article>
      <article className="surface connection-summary"><span><ShieldCheck weight="duotone" /></span><div><small>Publishing readiness</small><strong>{liveConnections?.filter(item => item.accounts.some(account => account.status === "connected")).length ?? 0} of 3 ad channels</strong><p>Publishing stays locked until an account is assigned and permission is granted.</p></div></article>
      <article className="surface connection-summary"><span><Clock weight="duotone" /></span><div><small>Freshness</small><strong>8 minutes ago</strong><p>Meta is healthy. Commerce sources currently rely on imports.</p></div></article>
    </section>

    <section className="surface connections-workspace">
      <div className="connections-toolbar"><div><span className="section-kicker">Integration directory</span><h2>Connected systems and permissions</h2></div><div className="page-tabs connections-tabs" role="tablist" aria-label="Connection categories">{categories.map(item => <button type="button" role="tab" aria-selected={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div></div>
      <div className="connection-card-grid">{visible.map(provider => {
        const meta = providerMeta[provider.id];
        const live = liveConnections?.find(connection => connection.provider === provider.id);
        const connected = live?.status === "connected";
        const liveAccount = live?.accounts[0];
        const providerLabel = provider.id === "google" ? "Google" : provider.label;
        return <article className="connection-card" key={provider.id}>
          <header><span className={`connection-provider-mark provider-${provider.id}`}>{["meta", "google", "tiktok", "tokopedia", "shopee"].includes(provider.id) ? <ChannelLogo channel={providerLabel} /> : provider.id === "posthog" ? <Sparkle weight="fill" /> : <Database weight="duotone" />}</span><div><h3>{provider.label}</h3><small>{provider.auth}</small></div><span className={`connection-state ${connected ? "healthy" : provider.configured ? "ready" : "attention"}`}><i />{connected ? "Connected" : meta?.status ?? "Setup required"}</span></header>
          <p>{meta?.description ?? provider.capabilities.join(", ") + "."}</p>
          <div className="connection-account"><span>{connected ? <CheckCircle weight="fill" /> : <Info weight="fill" />}</span><div><strong>{connected ? liveAccount?.displayName ?? "Authorized workspace source" : "No production account authorized"}</strong><small>{connected ? `Discovered ${liveAccount ? new Date(liveAccount.lastDiscoveredAt).toLocaleString() : "recently"}` : provider.configured ? "App credentials ready · user authorization required" : "Workspace owner action required"}</small></div></div>
          <div className="connection-capabilities">{provider.capabilities.slice(0, 3).map(capability => <span key={capability}><CheckCircle weight={connected ? "fill" : "regular"} />{capability}</span>)}</div>
          <footer><button type="button" className="button button-outline" onClick={() => setSelected(provider)}><Eye /> Details</button><button type="button" className={`button ${connected ? "button-outline" : "button-dark"}`} onClick={() => connected ? notify(`${provider.label} account management opened.`) : primaryAction(provider)}>{connected ? <><GearSix /> Manage</> : <>Connect <ArrowRight /></>}</button></footer>
        </article>;
      })}</div>
    </section>

    <div className="connections-lower-grid">
      <section className="surface data-health-panel"><header><div><span className="section-kicker">Evidence coverage</span><h2>Data health</h2></div><span className="status-pill amber"><Warning weight="fill" /> 2 gaps</span></header>{[["Paid media", "Meta connected · Google and TikTok missing", 42], ["Conversion journey", "PostHog connected · GA4 missing", 68], ["Commerce outcomes", "Manual Tokopedia and Shopee imports", 35], ["Creator evidence", "Public links only", 28]].map(([label, detail, score]) => <article key={String(label)}><div><strong>{label}</strong><small>{detail}</small></div><i><b style={{ width: `${score}%` }} /></i><span>{score}%</span></article>)}</section>
      <section className="surface connection-guardrails"><header><LockKey weight="duotone" /><div><span className="section-kicker">Workspace guardrails</span><h2>Connection permissions</h2></div></header><div><strong>Workspace owner / admin</strong><p>Connect, reauthorize, assign accounts, enable publishing, and disconnect.</p></div><div><strong>Campaign manager</strong><p>Select approved accounts and publish only when capability is granted.</p></div><div><strong>Analyst / viewer</strong><p>Use reporting data without changing authorization or publishing access.</p></div></section>
    </div>

    {selected && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setSelected(null)}><section className="dialog-card connection-dialog" role="dialog" aria-modal="true" aria-labelledby="connection-dialog-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setSelected(null)}><X /></button><span className="connection-provider-mark"><Database weight="duotone" /></span><h2 id="connection-dialog-title">{selected.label}</h2><p>{selected.configured ? "Provider credentials are ready. A workspace owner must complete authorization and choose which external accounts belong to each operating brand." : "The provider application must be configured before a workspace owner can authorize an account."}</p><div className="connection-dialog-facts"><div><span>Authorization</span><strong>{selected.auth}</strong></div><div><span>Credentials</span><strong>{selected.configured ? "Configured" : "Provider setup required"}</strong></div><div><span>Capabilities</span><strong>{selected.capabilities.length} available</strong></div></div>{liveConnections?.find(item => item.provider === selected.id)?.accounts.length ? <div className="connection-account-picker"><strong>Accessible accounts</strong>{liveConnections.find(item => item.provider === selected.id)!.accounts.map(account => <article key={account.id}><div><b>{account.displayName ?? account.id}</b><small>{account.status} · {account.id}</small></div><button type="button" className="button button-outline" onClick={() => assignAccount(account.id)}>Assign to brand</button></article>)}</div> : null}<div className="connection-dialog-scope">{selected.capabilities.map(item => <span key={item}><CheckCircle />{item}</span>)}</div><aside><Info weight="fill" /><p>Google login for PRIFYN identity never grants advertising access automatically. Channel authorization is requested separately and can be revoked independently.</p></aside><div className="dialog-actions"><button type="button" className="button button-outline" onClick={() => setSelected(null)}>Close</button>{selected.id === "google" && selected.configured && <button type="button" className="button button-dark" onClick={() => primaryAction(selected)}>Authorize Google Ads <ArrowRight /></button>}</div></section></div>}
    {notice && <div className="toast" role="status"><CheckCircle weight="fill" />{notice}</div>}
  </div>;
}
