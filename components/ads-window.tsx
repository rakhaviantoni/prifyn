"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Archive, ArrowRight, Broadcast, ChartBar, Check, CheckCircle, CloudArrowUp, Copy, Eye,
  FileArrowUp, ImageSquare, LinkSimple, LockSimple, Megaphone, NotePencil, PaperPlaneTilt, Play, Plus, Target, X,
} from "@phosphor-icons/react";
import { ChannelLogo } from "./channel-logo";
import { CampaignResults } from "./campaign-results";
import type { AdSummary, CampaignSummary } from "@/lib/campaign-summaries";

type Stage = "setup" | "channels" | "preview" | "results";
type AdsMode = "list" | "create";
type CreativeSource = "upload" | "existing";
type DeliveryStatus = "In review" | "Scheduled" | "Active" | "Learning" | "Learning limited" | "Not approved / Rejected" | "Completed";

const platforms = ["Meta", "Google", "TikTok", "Tokopedia", "Shopee"];
const ctaOptions = ["Shop Now", "Learn More", "Sign Up", "Download", "Contact Us", "Book Now", "Apply Now", "Message Us", "Send Message", "Subscribe", "Get Quote", "Listen Now", "Watch More", "See Menu", "See Details"];
const accounts: Record<string, string[]> = {
  Meta: ["No Meta publishing identity assigned"],
  TikTok: ["No TikTok advertiser assigned"],
  Google: ["No Google Ads account assigned"],
  Tokopedia: ["No Tokopedia shop assigned"],
  Shopee: ["No Shopee shop assigned"],
};
const statusCopy: Record<DeliveryStatus, string> = {
  "In review": "The channel is checking your creative and destination against policy rules.",
  Scheduled: "Approved and waiting for the selected start date.",
  Active: "Your campaign is live and delivering across connected channels.",
  Learning: "Delivery is testing audiences and placements to improve optimization.",
  "Learning limited": "The audience or budget is too small for stable optimization.",
  "Not approved / Rejected": "The ad breaks a provider policy rule and will not run.",
  Completed: "The campaign reached its end date and final reporting is available.",
};

export function AdsWindow({ initialCampaign, initialMode, campaigns = [], ads = [] }: { initialCampaign?: string; initialMode?: string; campaigns?: CampaignSummary[]; ads?: AdSummary[] }) {
  const [mode, setMode] = useState<AdsMode>(initialMode === "create" || initialCampaign ? "create" : "list");
  const [stage, setStage] = useState<Stage>("setup");
  const [campaignName, setCampaignName] = useState(initialCampaign || campaigns[0]?.name || "");
  const [creativeSource, setCreativeSource] = useState<CreativeSource>("upload");
  const [cta, setCta] = useState("Shop Now");
  const [caption, setCaption] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["Meta"]);
  const [connected, setConnected] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, string>>({ Meta: accounts.Meta[0], Google: accounts.Google[0], TikTok: accounts.TikTok[0], Tokopedia: accounts.Tokopedia[0], Shopee: accounts.Shopee[0] });
  const [setupSaved, setSetupSaved] = useState(false);
  const [channelsSaved, setChannelsSaved] = useState(false);
  const [published, setPublished] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>("In review");
  const [report, setReport] = useState("Performance");
  const [productionConnections, setProductionConnections] = useState<string[] | null>(null);
  const [selectedAd, setSelectedAd] = useState<AdSummary | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const reportReady = deliveryStatus === "Completed";
  const connectionsLoading = productionConnections === null;
  const readyConnections = productionConnections ?? [];
  const channelsReady = selectedPlatforms.length > 0 && selectedPlatforms.every(platform => readyConnections.includes(platform));

  useEffect(() => {
    fetch("/api/integrations/connections").then(response => response.ok ? response.json() : Promise.reject()).then((body: { connections?: Array<{ provider: string; accounts: Array<{ id: string; displayName: string | null }>; bindings: Array<{ providerAccountId: string; publishingEnabled: boolean }> }> }) => {
      const providerLabels: Record<string, string> = { meta: "Meta", google: "Google", tiktok: "TikTok", tokopedia: "Tokopedia", shopee: "Shopee" };
      const ready: string[] = [];
      const accountSelections: Record<string, string> = {};
      for (const connection of body.connections ?? []) {
        const binding = connection.bindings.find(item => item.publishingEnabled);
        const account = binding ? connection.accounts.find(item => item.id === binding.providerAccountId) : undefined;
        const label = providerLabels[connection.provider];
        if (label && account) { ready.push(label); accountSelections[label] = account.displayName ?? account.id; }
      }
      setProductionConnections(ready);
      setConnected(ready);
      setSelectedAccounts(current => ({ ...current, ...accountSelections }));
    }).catch(() => { setProductionConnections([]); setConnected([]); });
  }, []);

  function togglePlatform(platform: string) {
    setSelectedPlatforms(current => current.includes(platform) ? current.filter(item => item !== platform) : [...current, platform]);
    setChannelsSaved(false);
  }
  function saveSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSetupSaved(true);
    setStage("channels");
  }
  function saveChannels() {
    if (!channelsReady) return;
    setChannelsSaved(true);
    setStage("preview");
  }
  function publishCampaign() {
    setPublished(true);
    setDeliveryStatus("In review");
    setStage("results");
  }
  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2600);
  }

  const selectedMetaAccount = selectedAccounts.Meta ?? accounts.Meta[0];

  if (mode === "list") {
    const selectedCampaignAds = campaignName ? ads.filter(item => item.campaignName === campaignName) : ads;
    const adCampaignNames = Array.from(new Set(ads.map(item => item.campaignName)));
    const campaignOptions = campaigns.length ? campaigns.map(item => item.name) : adCampaignNames;
    const campaignCount = adCampaignNames.length;
    return <div className="app-content workflow-page">
      <header className="app-page-head"><div><span>Paid media workspace</span><h1>Ads Manager</h1><p>Monitor imported ads performance, connection readiness, and create new paid campaigns from a real campaign context.</p></div><button className="button button-dark" type="button" onClick={() => setMode("create")}><Plus weight="bold" /> Create ads campaign</button></header>
      <section className="surface ads-manager-command"><div><Megaphone weight="duotone" /><span><strong>{ads.length ? `${ads.length} ads imported across ${campaignCount || 1} campaign${campaignCount === 1 ? "" : "s"}.` : "Bring ads into PRIFYN from exports or connected accounts."}</strong><small>{ads.length ? "Review ad-level spend, reach, result cost, and delivery status before creating the next ad." : "Use imports while channel APIs are pending. Create new ads when you are ready to launch."}</small></span></div><div><button className="button button-outline" type="button" onClick={() => window.location.assign("/app/settings/connections")}>Manage connections</button><button className="button button-outline" type="button" onClick={() => window.location.assign("/app/settings/imports")}>Import report</button></div></section>
      {ads.length ? <><section className="surface ads-campaign-filter"><span>Campaign</span><select value={campaignName} onChange={event => setCampaignName(event.target.value)}>{campaignOptions.map(item => <option key={item}>{item}</option>)}</select><button className="button button-dark" type="button" onClick={() => setMode("create")}><Plus /> Create ad for this campaign</button></section><section className="surface table-wrap"><table className="data-table campaign-table ads-table"><thead><tr><th>Ad</th><th>Status</th><th>Results</th><th>Cost / result</th><th>Spend</th><th>Impressions</th><th>Reach</th><th>Actions</th></tr></thead><tbody>{selectedCampaignAds.map(item => <tr key={`${item.campaignName}-${item.adSetName}-${item.adName}`}><td><strong>{item.adName}</strong><small>{item.campaignName} · {item.adSetName}</small></td><td><span className={`status-pill ${item.status.toLowerCase().includes("archived") ? "neutral" : ""}`}>{item.status}</span></td><td><strong>{item.results}</strong><small>{item.resultType}</small></td><td>{item.costPerResult}</td><td>{item.spend}</td><td>{item.impressions}</td><td>{item.reach}</td><td><div className="table-action-group"><button className="table-action" type="button" onClick={() => setSelectedAd(item)}><Eye /> Detail</button><button className="table-action" type="button" onClick={() => { setCampaignName(item.campaignName); setMode("create"); }}><Copy /> Duplicate</button><button className="table-action" type="button" onClick={() => showNotice(`Note added for ${item.adName}.`)}><NotePencil /> Note</button></div></td></tr>)}</tbody></table></section></> : <section className="surface empty-state"><FileArrowUp /><h2>No ads data yet</h2><p>Import a platform export or create a campaign first. Production Ads Manager will not show sample Ramadan campaigns inside a real workspace.</p><div className="empty-actions"><button className="button button-dark" type="button" onClick={() => setMode("create")}>Create manual draft</button><button className="button button-outline" type="button" onClick={() => window.location.assign("/app/settings/imports")}>Import report</button></div></section>}
      {selectedAd && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setSelectedAd(null)}><section className="dialog-card ad-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="ad-detail-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setSelectedAd(null)}><X /></button><span className="section-kicker">{selectedAd.source}</span><h2 id="ad-detail-title">{selectedAd.adName}</h2><p>{selectedAd.campaignName} · {selectedAd.adSetName}</p><div className="campaign-detail-grid"><div><span>Status</span><strong>{selectedAd.status}</strong></div><div><span>Result type</span><strong>{selectedAd.resultType}</strong></div><div><span>Results</span><strong>{selectedAd.results}</strong></div><div><span>Cost / result</span><strong>{selectedAd.costPerResult}</strong></div><div><span>Spend</span><strong>{selectedAd.spend}</strong></div><div><span>Reach / impressions</span><strong>{selectedAd.reach} / {selectedAd.impressions}</strong></div></div><section className="ad-next-actions"><h3>Available actions</h3><button type="button" onClick={() => { setCampaignName(selectedAd.campaignName); setSelectedAd(null); setMode("create"); }}><Copy /> Duplicate into a new draft <ArrowRight /></button><a href={`/app/reports?campaign=${encodeURIComponent(selectedAd.campaignName)}`}><ChartBar /> Open campaign report <ArrowRight /></a><button type="button" onClick={() => showNotice(`Optimization note saved for ${selectedAd.adName}.`)}><NotePencil /> Add optimization note <ArrowRight /></button><button type="button" onClick={() => showNotice(`${selectedAd.adName} marked for archive review.`)}><Archive /> Mark for archive review <ArrowRight /></button></section></section></div>}
      {notice && <div className="toast"><CheckCircle weight="fill" />{notice}</div>}
    </div>;
  }

  return <div className="app-content workflow-page">
    <header className="app-page-head"><div><span>Paid media setup</span><h1>Create ads campaign</h1><p>Set up, connect, review, and publish a paid campaign draft across selected channels.</p></div><div className="app-head-actions"><button className="button button-outline" type="button" onClick={() => setMode("list")}>Back to Ads Manager</button><span className={`workflow-health ${deliveryStatus === "Active" ? "live" : ""}`}><i />{published ? deliveryStatus : channelsSaved ? "Ready to publish" : setupSaved ? "Account setup" : "Draft"}</span></div></header>
    <WorkflowSteps active={stage} setupSaved={setupSaved} channelsSaved={channelsSaved} published={published} onChange={setStage} />

    {stage === "setup" && <form onSubmit={saveSetup} className="workflow-grid">
      <section className="surface workflow-card"><div className="workflow-card-head"><span><Target weight="duotone" /></span><div><small>Campaign setup</small><h2>Define the outcome</h2></div></div><div className="workflow-form-grid">
        <label className="field"><span>Campaign objective</span><select required defaultValue="Sales / Order"><option>Awareness</option><option>Traffic</option><option>Engagement</option><option>Leads</option><option>Sales / Order</option></select></label>
        {campaigns.length ? <label className="field"><span>Campaign name</span><select required value={campaignName} onChange={event => setCampaignName(event.target.value)}>{campaigns.map(item => <option key={item.name}>{item.name}</option>)}</select><small>Select existing campaign or create one from Campaigns first.</small></label> : <label className="field"><span>Campaign name</span><input required value={campaignName} onChange={event => setCampaignName(event.target.value)} placeholder="e.g. Ramadan Bundle Push" /></label>}
        <label className="field"><span>Conversion event</span><select required defaultValue="Purchase"><option>Purchase</option><option>Lead form submit</option><option>Add to cart</option><option>Landing page view</option></select></label>
        <label className="field"><span>Budget</span><input required type="number" placeholder="e.g. 28000000" /></label>
        <label className="field"><span>Start date</span><input required type="date" /></label>
        <label className="field"><span>End date</span><input required type="date" /></label>
        <label className="field field-wide"><span>Audience</span><textarea required placeholder="Location, age range, interests, custom audience, exclusion, or remarketing context." /></label>
      </div></section>
      <section className="surface workflow-card"><div className="workflow-card-head"><span><CloudArrowUp weight="duotone" /></span><div><small>Creative context</small><h2>Choose how the ad will be created</h2></div></div>
        <div className="creative-source-picker" role="radiogroup" aria-label="Creative source"><button type="button" role="radio" aria-checked={creativeSource === "upload"} className={creativeSource === "upload" ? "selected" : ""} onClick={() => setCreativeSource("upload")}><ImageSquare weight="duotone" /><span><strong>Upload image / video</strong><small>Create a new ad with fresh copy and keywords.</small></span><CheckCircle weight={creativeSource === "upload" ? "fill" : "regular"} /></button><button type="button" role="radio" aria-checked={creativeSource === "existing"} className={creativeSource === "existing" ? "selected" : ""} onClick={() => setCreativeSource("existing")}><LinkSimple weight="duotone" /><span><strong>Use existing post</strong><small>Promote a published post with its original caption.</small></span><CheckCircle weight={creativeSource === "existing" ? "fill" : "regular"} /></button></div>
        <div className="workflow-form-grid creative-fields"><label className="field"><span>Creative name</span><input required placeholder="e.g. Video A · Creator hook" /></label>{creativeSource === "upload" ? <label className="field field-wide upload-field"><span>Image or video</span><input type="file" accept="image/*,video/*" /><small>Channel requirements will be validated before publishing.</small></label> : readyConnections.some(channel => ["Meta", "TikTok"].includes(channel)) ? <label className="field field-wide"><span>Existing connected post</span><select required><option>Select a connected post after account authorization</option></select><small>Connected Meta/TikTok accounts can load existing posts. Original caption and media will be preserved.</small></label> : <label className="field field-wide"><span>Manual existing post link</span><input required type="url" placeholder="https://www.instagram.com/reel/..." /><small>Until the channel is connected, paste a public post URL for preview, notes, and tracking setup.</small></label>}
          {creativeSource === "upload" && <label className="field field-wide"><span>Ad copy and keywords</span><textarea required value={caption} onChange={event => setCaption(event.target.value)} placeholder="Write the ad caption, hook, offer, and keyword notes." /></label>}
          <label className="field"><span>Call to action</span><select value={cta} onChange={event => setCta(event.target.value)}>{ctaOptions.map(option => <option key={option}>{option}</option>)}</select></label>
          <label className="field"><span>Destination URL</span><input required type="url" value={destination} onChange={event => setDestination(event.target.value)} placeholder="https://yourdomain.com/campaign?utm_source=..." /></label>
          <label className="field field-wide"><span>Conversion tracking</span><select defaultValue="UTM + pixel"><option>UTM + pixel</option><option>UTM only</option><option>Server-side conversion</option></select></label>
        </div><button className="button button-dark workflow-submit" type="submit">Continue to channels <ArrowRight /></button>
      </section>
    </form>}

    {stage === "channels" && <div className="workflow-stack"><section className="surface workflow-card"><div className="workflow-card-head"><span><LinkSimple weight="duotone" /></span><div><small>Channel & account</small><h2>Choose where—and under which account—the ad will run</h2><p>{connectionsLoading ? "Checking brand-assigned channel accounts…" : "Only brand-assigned accounts with publishing permission can continue."}</p></div></div><fieldset className="field platform-picker channel-picker"><legend>Selected channels</legend>{platforms.map(platform => <label key={platform} className={selectedPlatforms.includes(platform) ? "selected" : ""}><input type="checkbox" checked={selectedPlatforms.includes(platform)} onChange={() => togglePlatform(platform)} /><span className="platform-option"><ChannelLogo channel={platform} />{platform}</span></label>)}</fieldset><div className="meta-account-note"><strong>Meta can route through Instagram, Facebook, or WhatsApp.</strong><span>Pick the owned identity that matches the creative and CTA. WhatsApp usually fits Message Us / Contact Us campaigns.</span></div><div className="account-connection-list">{platforms.map(platform => { const selected = selectedPlatforms.includes(platform); const isConnected = connected.includes(platform); return <article key={platform} className={!selected ? "disabled" : ""}><div className="channel-account-head"><span className="channel-logo"><ChannelLogo channel={platform} /></span><div><strong>{platform}</strong><small>{!selected ? "Not selected" : connectionsLoading ? "Checking assigned accounts" : isConnected ? "Authorized for this operating brand" : "No publishing-ready account assigned"}</small></div><button type="button" className={`button ${isConnected ? "button-outline" : "button-dark"}`} disabled={!selected || connectionsLoading} onClick={() => { window.location.assign("/app/settings/connections"); }}>{isConnected ? <><CheckCircle weight="fill" /> Publishing ready</> : connectionsLoading ? "Checking…" : "Manage connection"}</button></div>{selected && isConnected && <label className="field"><span>{platform === "Meta" ? "Publishing identity" : "Publishing account"}</span><select value={selectedAccounts[platform]} onChange={event => setSelectedAccounts(current => ({ ...current, [platform]: event.target.value }))}><option>{selectedAccounts[platform]}</option></select></label>}</article>; })}</div></section><section className="surface channel-ready-card"><div><CheckCircle weight="fill" /><span><strong>{channelsReady ? "All selected channels have a publishing-ready account." : connectionsLoading ? "Checking publishing access…" : "Assign publishing access for every selected channel to continue."}</strong>{selectedPlatforms.length} selected · {selectedPlatforms.filter(item => connected.includes(item)).length} ready</span></div><button type="button" className="button button-dark" disabled={!channelsReady} onClick={saveChannels}>Review campaign <ArrowRight /></button></section></div>}

    {stage === "channels" && <aside className="surface google-connection-note"><span className="channel-logo"><ChannelLogo channel="Google" /></span><div><strong>Google sign-in and Google Ads access are separate.</strong><p>Signing in creates your PRIFYN identity only. Connecting Google Ads requires another approval for the adwords permission, followed by customer-account selection.</p></div><span className="status-pill neutral">Additional permission</span></aside>}

    {stage === "preview" && <div className="preview-workspace"><section className="surface workflow-card preview-summary"><div className="workflow-card-head"><span><Eye weight="duotone" /></span><div><small>Pre-publish review</small><h2>Confirm every customer-facing detail</h2><p>Nothing will publish until you approve this page.</p></div></div><div className="preview-facts"><div><span>Campaign</span><strong>{campaignName || "Untitled campaign"}</strong><small>Ads draft · selected campaign context</small></div><div><span>Creative source</span><strong>{creativeSource === "upload" ? "New image / video" : "Existing social post"}</strong><small>{creativeSource === "upload" ? "New caption included" : "Original caption preserved"}</small></div><div><span>CTA & destination</span><strong>{cta}</strong><small>{destination ? destination.replace(/^https?:\/\//, "") : "Destination not set"}</small></div><div><span>Channels</span><strong>{selectedPlatforms.join(" · ")}</strong><small>{selectedPlatforms.map(item => selectedAccounts[item].split(" · ")[0]).join(" · ")}</small></div></div><div className="publish-checklist"><span><CheckCircle weight="fill" /> Publishing accounts confirmed</span><span><CheckCircle weight="fill" /> Creative and caption reviewed</span><span><CheckCircle weight="fill" /> CTA opens the correct destination</span><span><CheckCircle weight="fill" /> Tracking is configured</span></div></section><section className="ad-preview-grid">{selectedPlatforms.includes("Meta") && <AdPreview campaignName={campaignName} platform={`Sponsored · ${selectedMetaAccount.includes("WhatsApp") ? "WhatsApp" : selectedMetaAccount.includes("Facebook") ? "Facebook" : "Instagram"}`} account={selectedAccounts.Meta} source={creativeSource} caption={caption} cta={cta} destination={destination} />}{selectedPlatforms.includes("TikTok") && <AdPreview campaignName={campaignName} platform="Sponsored · TikTok" account={selectedAccounts.TikTok} source={creativeSource} caption={caption} cta={cta} destination={destination} />}{!selectedPlatforms.includes("Meta") && !selectedPlatforms.includes("TikTok") && <AdPreview campaignName={campaignName} platform={`Sponsored · ${selectedPlatforms[0]}`} account={selectedAccounts[selectedPlatforms[0]]} source={creativeSource} caption={caption} cta={cta} destination={destination} />}</section><section className="surface publish-bar"><div><PaperPlaneTilt weight="duotone" /><span><strong>Ready for channel review</strong>Publishing creates channel drafts and submits them for policy review.</span></div><div><button type="button" className="button button-outline" onClick={() => setStage("setup")}>Edit setup</button><button type="button" className="button button-dark button-large" onClick={publishCampaign}><PaperPlaneTilt weight="fill" /> Publish campaign</button></div></section></div>}

    {stage === "results" && <div className="workflow-stack"><section className="surface delivery-status-card"><div className="delivery-status-main"><span className={`delivery-orb status-${deliveryStatus.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}><Broadcast weight="fill" /></span><div><span className="section-kicker">Delivery status</span><h2>{deliveryStatus}</h2><p>{statusCopy[deliveryStatus]}</p></div></div><label className="field"><span>Update status</span><select value={deliveryStatus} onChange={event => setDeliveryStatus(event.target.value as DeliveryStatus)}><option>In review</option><option>Scheduled</option><option>Active</option><option>Learning</option><option>Learning limited</option><option>Not approved / Rejected</option><option>Completed</option></select></label></section>{!reportReady ? <section className="surface report-pending"><ChartBar weight="duotone" /><div><span>Reporting pending</span><h2>Report will be ready 3 days after your campaign starts.</h2><p>PRIFYN is waiting for stable delivery and attribution signals. You can still monitor review, scheduling, and learning status above.</p></div><time>Expected · 3 days after start</time></section> : <CampaignResults report={report} onReportChange={setReport} />}</div>}
  </div>;
}

function WorkflowSteps({ active, setupSaved, channelsSaved, published, onChange }: { active: Stage; setupSaved: boolean; channelsSaved: boolean; published: boolean; onChange: (stage: Stage) => void }) {
  const steps = [["setup", "Setup", "Goal, audience, creative"], ["channels", "Channel & Account", "Connect and choose identities"], ["preview", "Preview", "Review before publish"], ["results", "Results", "Status and reporting"]] as const;
  return <nav className="workflow-steps ads-workflow-steps" aria-label="Ads campaign stages">{steps.map(([key, title, detail], index) => { const locked = key === "channels" ? !setupSaved : key === "preview" ? !channelsSaved : key === "results" ? !published : false; const done = key === "setup" ? setupSaved : key === "channels" ? channelsSaved : key === "preview" ? published : false; return <button key={key} type="button" disabled={locked} aria-current={active === key ? "step" : undefined} className={`${active === key ? "active" : ""} ${done ? "done" : ""}`} onClick={() => onChange(key)}><b>{locked ? <LockSimple /> : done ? <Check /> : index + 1}</b><span><strong>{title}</strong><small>{locked ? "Complete the previous step" : detail}</small></span></button>; })}</nav>;
}

function AdPreview({ campaignName, platform, account, source, caption, cta, destination }: { campaignName: string; platform: string; account: string; source: CreativeSource; caption: string; cta: string; destination: string }) {
  return <article className="surface ad-preview-card"><header><span className="ad-preview-avatar">AD</span><div><strong>{account.split(" · ")[0]}</strong><small>{platform}</small></div><b>•••</b></header><div className={`ad-preview-media ${source}`}><span>{source === "upload" ? <><Play weight="fill" /> New campaign creative</> : <><LinkSimple /> Existing post preview</>}</span></div><div className="ad-preview-copy"><p>{source === "upload" ? caption || "Your ad copy will appear here." : "Existing post caption will be preserved from the connected platform or manual post link."}</p><div><span><small>{destination ? destination.replace(/^https?:\/\//, "") : "destination-url"}</small><strong>{campaignName || "Untitled campaign"}</strong></span><button type="button">{cta}</button></div></div></article>;
}
