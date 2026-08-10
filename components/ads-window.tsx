"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight, Broadcast, ChartBar, Check, CheckCircle, CloudArrowUp, Eye,
  ImageSquare, LinkSimple, LockSimple, PaperPlaneTilt, Play, Target,
} from "@phosphor-icons/react";
import { ChannelLogo } from "./channel-logo";
import { CampaignResults } from "./campaign-results";

type Stage = "setup" | "channels" | "preview" | "results";
type CreativeSource = "upload" | "existing";
type DeliveryStatus = "In review" | "Scheduled" | "Active" | "Learning" | "Learning limited" | "Not approved / Rejected" | "Completed";

const platforms = ["Meta", "Google", "TikTok", "Tokopedia", "Shopee"];
const reportTypes = ["Performance", "Audience", "Location", "Creative", "User journey"];
const ctaOptions = ["Shop Now", "Learn More", "Sign Up", "Download", "Contact Us", "Book Now", "Apply Now", "Message Us", "Send Message", "Subscribe", "Get Quote", "Listen Now", "Watch More", "See Menu", "See Details"];
const accounts: Record<string, string[]> = {
  Meta: ["@nusaspice.id · Instagram", "Nusa Spice Indonesia · Facebook"],
  TikTok: ["@nusaspice · TikTok", "@dapur.nusa · TikTok"],
  Google: ["Nusa Spice · ID-384-221-9064", "Dapur Saji · ID-718-905-1132"],
  Tokopedia: ["Nusa Spice Official Store"],
  Shopee: ["Nusa Spice Indonesia"],
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

export function AdsWindow() {
  const [stage, setStage] = useState<Stage>("setup");
  const [creativeSource, setCreativeSource] = useState<CreativeSource>("upload");
  const [cta, setCta] = useState("Shop Now");
  const [caption, setCaption] = useState("Buka puasa terasa lebih dekat bersama Nusa Spice. #RamadanMadeSimple #MasakBersama");
  const [destination, setDestination] = useState("https://example.com/ramadan");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["Meta", "Google", "TikTok"]);
  const [connected, setConnected] = useState(["Meta"]);
  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, string>>({ Meta: accounts.Meta[0], Google: accounts.Google[0], TikTok: accounts.TikTok[0], Tokopedia: accounts.Tokopedia[0], Shopee: accounts.Shopee[0] });
  const [setupSaved, setSetupSaved] = useState(false);
  const [channelsSaved, setChannelsSaved] = useState(false);
  const [published, setPublished] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>("In review");
  const [report, setReport] = useState("Performance");
  const reportReady = deliveryStatus === "Completed";
  const channelsReady = selectedPlatforms.length > 0 && selectedPlatforms.every(platform => connected.includes(platform));

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

  return <div className="app-content workflow-page">
    <header className="app-page-head"><div><span>Paid media workspace</span><h1>Ads Manager</h1><p>Set up, connect, review, and publish campaigns across paid channels.</p></div><span className={`workflow-health ${deliveryStatus === "Active" ? "live" : ""}`}><i />{published ? deliveryStatus : channelsSaved ? "Ready to publish" : setupSaved ? "Account setup" : "Draft"}</span></header>
    <WorkflowSteps active={stage} setupSaved={setupSaved} channelsSaved={channelsSaved} published={published} onChange={setStage} />

    {stage === "setup" && <form onSubmit={saveSetup} className="workflow-grid">
      <section className="surface workflow-card"><div className="workflow-card-head"><span><Target weight="duotone" /></span><div><small>Campaign setup</small><h2>Define the outcome</h2></div></div><div className="workflow-form-grid">
        <label className="field"><span>Campaign objective</span><select required defaultValue="Sales / Order"><option>Awareness</option><option>Traffic</option><option>Engagement</option><option>Leads</option><option>Sales / Order</option></select></label>
        <label className="field"><span>Campaign name</span><input required defaultValue="Ramadan Made Simple" /></label>
        <label className="field"><span>Conversion event</span><select required defaultValue="Purchase"><option>Purchase</option><option>Lead form submit</option><option>Add to cart</option><option>Landing page view</option></select></label>
        <label className="field"><span>Budget</span><input required type="number" defaultValue="28000000" /></label>
        <label className="field"><span>Start date</span><input required type="date" defaultValue="2026-08-10" /></label>
        <label className="field"><span>End date</span><input required type="date" defaultValue="2026-08-30" /></label>
        <label className="field field-wide"><span>Audience</span><textarea required defaultValue="Indonesia · 24–44 · Food, family dining, home cooking · Existing customer lookalike" /></label>
      </div></section>
      <section className="surface workflow-card"><div className="workflow-card-head"><span><CloudArrowUp weight="duotone" /></span><div><small>Creative context</small><h2>Choose how the ad will be created</h2></div></div>
        <div className="creative-source-picker" role="radiogroup" aria-label="Creative source"><button type="button" role="radio" aria-checked={creativeSource === "upload"} className={creativeSource === "upload" ? "selected" : ""} onClick={() => setCreativeSource("upload")}><ImageSquare weight="duotone" /><span><strong>Upload image / video</strong><small>Create a new ad with fresh copy and keywords.</small></span><CheckCircle weight={creativeSource === "upload" ? "fill" : "regular"} /></button><button type="button" role="radio" aria-checked={creativeSource === "existing"} className={creativeSource === "existing" ? "selected" : ""} onClick={() => setCreativeSource("existing")}><LinkSimple weight="duotone" /><span><strong>Use existing post</strong><small>Promote a published post with its original caption.</small></span><CheckCircle weight={creativeSource === "existing" ? "fill" : "regular"} /></button></div>
        <div className="workflow-form-grid creative-fields"><label className="field"><span>Creative name</span><input required defaultValue="Family Table · Video A" /></label>{creativeSource === "upload" ? <label className="field field-wide upload-field"><span>Image or video <em>Optional in preview</em></span><input type="file" accept="image/*,video/*" /><small>Channel requirements will be validated before publishing.</small></label> : <label className="field field-wide"><span>Existing post</span><select required defaultValue="Family iftar recipe · Instagram Reel"><option>Family iftar recipe · Instagram Reel</option><option>One-pan dinner · TikTok post</option><option>Ramadan menu launch · Facebook post</option></select><small>The original post caption and media will be preserved.</small></label>}
          {creativeSource === "upload" && <label className="field field-wide"><span>Ad copy and keywords</span><textarea required value={caption} onChange={event => setCaption(event.target.value)} /></label>}
          <label className="field"><span>Call to action</span><select value={cta} onChange={event => setCta(event.target.value)}>{ctaOptions.map(option => <option key={option}>{option}</option>)}</select></label>
          <label className="field"><span>Destination URL</span><input required type="url" value={destination} onChange={event => setDestination(event.target.value)} /></label>
          <label className="field field-wide"><span>Conversion tracking</span><select defaultValue="UTM + pixel"><option>UTM + pixel</option><option>UTM only</option><option>Server-side conversion</option></select></label>
        </div><button className="button button-dark workflow-submit" type="submit">Continue to channels <ArrowRight /></button>
      </section>
    </form>}

    {stage === "channels" && <div className="workflow-stack"><section className="surface workflow-card"><div className="workflow-card-head"><span><LinkSimple weight="duotone" /></span><div><small>Channel & account</small><h2>Choose where—and under which account—the ad will run</h2><p>Demo accounts are marked clearly. Production connections require an approved provider app and encrypted token storage.</p></div></div><fieldset className="field platform-picker channel-picker"><legend>Selected channels</legend>{platforms.map(platform => <label key={platform} className={selectedPlatforms.includes(platform) ? "selected" : ""}><input type="checkbox" checked={selectedPlatforms.includes(platform)} onChange={() => togglePlatform(platform)} /><span className="platform-option"><ChannelLogo channel={platform} />{platform}</span></label>)}</fieldset><div className="account-connection-list">{platforms.map(platform => { const selected = selectedPlatforms.includes(platform); const isConnected = connected.includes(platform); return <article key={platform} className={!selected ? "disabled" : ""}><div className="channel-account-head"><span className="channel-logo"><ChannelLogo channel={platform} /></span><div><strong>{platform}</strong><small>{!selected ? "Not selected" : isConnected ? "Demo connection · choose the publishing identity" : "Provider app setup required"}</small></div><button type="button" className={`button ${isConnected ? "button-outline" : "button-dark"}`} disabled={!selected} onClick={() => { setConnected(current => isConnected ? current.filter(item => item !== platform) : [...current, platform]); setChannelsSaved(false); }}>{isConnected ? <><CheckCircle weight="fill" /> Demo connected</> : "Preview connection"}</button></div>{selected && isConnected && <label className="field"><span>Publishing account</span><select value={selectedAccounts[platform]} onChange={event => setSelectedAccounts(current => ({ ...current, [platform]: event.target.value }))}>{accounts[platform].map(account => <option key={account}>{account}</option>)}</select></label>}</article>; })}</div></section><section className="surface channel-ready-card"><div><CheckCircle weight="fill" /><span><strong>{channelsReady ? "All selected channels have an account." : "Connect every selected channel to continue."}</strong>{selectedPlatforms.length} selected · {selectedPlatforms.filter(item => connected.includes(item)).length} ready</span></div><button type="button" className="button button-dark" disabled={!channelsReady} onClick={saveChannels}>Review campaign <ArrowRight /></button></section></div>}

    {stage === "preview" && <div className="preview-workspace"><section className="surface workflow-card preview-summary"><div className="workflow-card-head"><span><Eye weight="duotone" /></span><div><small>Pre-publish review</small><h2>Confirm every customer-facing detail</h2><p>Nothing will publish until you approve this page.</p></div></div><div className="preview-facts"><div><span>Campaign</span><strong>Ramadan Made Simple</strong><small>Sales / Order · Purchase</small></div><div><span>Creative source</span><strong>{creativeSource === "upload" ? "New image / video" : "Existing social post"}</strong><small>{creativeSource === "upload" ? "New caption included" : "Original caption preserved"}</small></div><div><span>CTA & destination</span><strong>{cta}</strong><small>{destination.replace(/^https?:\/\//, "")}</small></div><div><span>Channels</span><strong>{selectedPlatforms.join(" · ")}</strong><small>{selectedPlatforms.map(item => selectedAccounts[item].split(" · ")[0]).join(" · ")}</small></div></div><div className="publish-checklist"><span><CheckCircle weight="fill" /> Publishing accounts confirmed</span><span><CheckCircle weight="fill" /> Creative and caption reviewed</span><span><CheckCircle weight="fill" /> CTA opens the correct destination</span><span><CheckCircle weight="fill" /> Tracking is configured</span></div></section><section className="ad-preview-grid">{selectedPlatforms.includes("Meta") && <AdPreview platform="Sponsored · Instagram" account={selectedAccounts.Meta} source={creativeSource} caption={caption} cta={cta} destination={destination} />}{selectedPlatforms.includes("TikTok") && <AdPreview platform="Sponsored · TikTok" account={selectedAccounts.TikTok} source={creativeSource} caption={caption} cta={cta} destination={destination} />}{!selectedPlatforms.includes("Meta") && !selectedPlatforms.includes("TikTok") && <AdPreview platform={`Sponsored · ${selectedPlatforms[0]}`} account={selectedAccounts[selectedPlatforms[0]]} source={creativeSource} caption={caption} cta={cta} destination={destination} />}</section><section className="surface publish-bar"><div><PaperPlaneTilt weight="duotone" /><span><strong>Ready for channel review</strong>Publishing creates channel drafts and submits them for policy review.</span></div><div><button type="button" className="button button-outline" onClick={() => setStage("setup")}>Edit setup</button><button type="button" className="button button-dark button-large" onClick={publishCampaign}><PaperPlaneTilt weight="fill" /> Publish campaign</button></div></section></div>}

    {stage === "results" && <div className="workflow-stack"><section className="surface delivery-status-card"><div className="delivery-status-main"><span className={`delivery-orb status-${deliveryStatus.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}><Broadcast weight="fill" /></span><div><span className="section-kicker">Delivery status</span><h2>{deliveryStatus}</h2><p>{statusCopy[deliveryStatus]}</p></div></div><label className="field"><span>Preview status</span><select value={deliveryStatus} onChange={event => setDeliveryStatus(event.target.value as DeliveryStatus)}><option>In review</option><option>Scheduled</option><option>Active</option><option>Learning</option><option>Learning limited</option><option>Not approved / Rejected</option><option>Completed</option></select></label></section>{!reportReady ? <section className="surface report-pending"><ChartBar weight="duotone" /><div><span>Reporting pending</span><h2>Report will be ready 3 days after your campaign starts.</h2><p>PRIFYN is waiting for stable delivery and attribution signals. You can still monitor review, scheduling, and learning status above.</p></div><time>Expected · 13 Aug 2026</time></section> : <><section className="surface report-overview"><div className="report-score"><span>Overall ROAS</span><strong>3.42×</strong><small>↑ 0.31× vs previous period</small></div><div className="metric-grid"><Metric label="Reach" value="1.84m" /><Metric label="Impressions" value="3.21m" /><Metric label="Clicks" value="91.2k" /><Metric label="CTR" value="2.84%" /></div><div className="metric-grid"><Metric label="Engagement" value="128k" /><Metric label="Leads / orders" value="4,816" /><Metric label="Conversion rate" value="5.28%" /><Metric label="Attributed revenue" value="Rp 86.4m" /></div></section><section className="surface workflow-card"><div className="workflow-card-head"><span><ChartBar weight="duotone" /></span><div><small>Campaign results</small><h2>{report} report</h2></div></div><div className="page-tabs" role="tablist" aria-label="Ads reports">{reportTypes.map(item => <button type="button" role="tab" aria-selected={report === item} className={report === item ? "active" : ""} onClick={() => setReport(item)} key={item}>{item}</button>)}</div><div className="report-bars">{[["Meta",82],["TikTok",68],["Google",54],["Tokopedia",31],["Shopee",24]].map(([label,value]) => <div key={label}><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{report === "Performance" ? `${Number(value) / 20 + 1.2}×` : `${value}%`}</strong></div>)}</div><div className="evidence-strip"><CheckCircle weight="fill" /><span><strong>Recommended next step:</strong> keep creator-led Meta placements and reduce broad Google spend by 15%.</span><small>High confidence · refreshed 12 min ago</small></div></section></>}</div>}
    {stage === "results" && reportReady && <CampaignResults report={report} onReportChange={setReport} />}
  </div>;
}

function WorkflowSteps({ active, setupSaved, channelsSaved, published, onChange }: { active: Stage; setupSaved: boolean; channelsSaved: boolean; published: boolean; onChange: (stage: Stage) => void }) {
  const steps = [["setup", "Setup", "Goal, audience, creative"], ["channels", "Channel & Account", "Connect and choose identities"], ["preview", "Preview", "Review before publish"], ["results", "Results", "Status and reporting"]] as const;
  return <nav className="workflow-steps ads-workflow-steps" aria-label="Ads campaign stages">{steps.map(([key, title, detail], index) => { const locked = key === "channels" ? !setupSaved : key === "preview" ? !channelsSaved : key === "results" ? !published : false; const done = key === "setup" ? setupSaved : key === "channels" ? channelsSaved : key === "preview" ? published : false; return <button key={key} type="button" disabled={locked} aria-current={active === key ? "step" : undefined} className={`${active === key ? "active" : ""} ${done ? "done" : ""}`} onClick={() => onChange(key)}><b>{locked ? <LockSimple /> : done ? <Check /> : index + 1}</b><span><strong>{title}</strong><small>{locked ? "Complete the previous step" : detail}</small></span></button>; })}</nav>;
}

function AdPreview({ platform, account, source, caption, cta, destination }: { platform: string; account: string; source: CreativeSource; caption: string; cta: string; destination: string }) {
  return <article className="surface ad-preview-card"><header><span className="ad-preview-avatar">NS</span><div><strong>{account.split(" · ")[0]}</strong><small>{platform}</small></div><b>•••</b></header><div className={`ad-preview-media ${source}`}><span>{source === "upload" ? <><Play weight="fill" /> New campaign creative</> : <><LinkSimple /> Existing post preview</>}</span></div><div className="ad-preview-copy"><p>{source === "upload" ? caption : "Resep buka puasa praktis untuk keluarga—published 2 Aug 2026."}</p><div><span><small>{destination.replace(/^https?:\/\//, "")}</small><strong>Ramadan Made Simple</strong></span><button type="button">{cta}</button></div></div></article>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="metric-box"><span>{label}</span><strong>{value}</strong></div>; }
