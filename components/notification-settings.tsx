"use client";

import { Bell, CheckCircle, LinkSimple, PlugsConnected, ShieldCheck } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type Webhook = { id: string; name: string; url: string; events: string[]; status: string; lastDeliveredAt: string | null };

export function NotificationSettings() {
  const [notice, setNotice] = useState<string | null>(null);
  const [recipients, setRecipients] = useState("");
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [secret, setSecret] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/email-preferences", { credentials: "include" }).then(r => r.ok ? r.json() : Promise.reject()).then((data: { preferences?: { recipients?: string[] } | null }) => setRecipients(data.preferences?.recipients?.join(", ") ?? "")).catch(() => undefined);
    fetch("/api/webhooks", { credentials: "include" }).then(r => r.ok ? r.json() : Promise.reject()).then((data: { endpoints?: Webhook[] }) => setWebhooks(data.endpoints ?? [])).catch(() => undefined);
  }, []);

  async function saveEmail(form: FormData) {
    setNotice("Saving email preferences…");
    const payload = {
      leadAlerts: form.get("leadAlerts") === "on",
      reportEmails: form.get("reportEmails") === "on",
      teamInvites: form.get("teamInvites") === "on",
      billingEmails: form.get("billingEmails") === "on",
      campaignApprovals: form.get("campaignApprovals") === "on",
      recipients: form.get("recipients"),
    };
    const response = await fetch("/api/settings/email-preferences", { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
    setNotice(response.ok ? "Email preferences saved." : "Email preferences could not be saved.");
    window.setTimeout(() => setNotice(null), 2800);
  }

  async function createWebhook(form: FormData) {
    setNotice("Saving webhook…");
    const events = String(form.get("events") || "*").split(/[,;\n]/).map(item => item.trim()).filter(Boolean);
    const response = await fetch("/api/webhooks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: form.get("name"), url: form.get("url"), events, status: "active" }),
    });
    const data = await response.json().catch(() => ({})) as { endpoint?: Webhook; signingSecret?: string; error?: string };
    if (response.ok && data.endpoint) {
      setWebhooks(current => [data.endpoint!, ...current]);
      setSecret(data.signingSecret ?? null);
      setNotice("Webhook saved. Copy the signing secret now.");
    } else {
      setNotice(data.error || "Webhook could not be saved.");
    }
    window.setTimeout(() => setNotice(null), 4200);
  }

  return <div className="app-content"><header className="app-page-head"><div><span>Notifications & automations</span><h1>Email & webhooks</h1><p>Control who receives PRIFYN emails and where workflow events are delivered.</p></div></header><div className="settings-detail-grid"><section className="surface settings-detail-card"><div className="surface-head"><div><h2><Bell /> Email preferences</h2><span>Lead alerts, reports, invites, billing, and approvals.</span></div><span className="status-pill"><CheckCircle weight="fill" /> Resend-ready</span></div><form className="dialog-form" action={saveEmail}><label className="field"><span>Default recipients</span><textarea name="recipients" value={recipients} onChange={event => setRecipients(event.target.value)} placeholder="owner@brand.com, finance@brand.com" /></label><div className="preference-checks">{["leadAlerts:Lead alerts", "reportEmails:Report emails", "teamInvites:Team invitations", "billingEmails:Billing emails", "campaignApprovals:Campaign approvals"].map(item => { const [name, label] = item.split(":"); return <label key={name}><input name={name} type="checkbox" defaultChecked /><span>{label}</span></label>; })}</div><button className="button button-dark" type="submit">Save email preferences</button></form></section><section className="surface settings-detail-card"><div className="surface-head"><div><h2><PlugsConnected /> Webhooks</h2><span>Send PRIFYN events to internal tools, warehouses, or automation platforms.</span></div><span className="status-pill neutral"><ShieldCheck /> Signed</span></div><form className="dialog-form" action={createWebhook}><label className="field"><span>Name</span><input name="name" required placeholder="Internal data pipeline" /></label><label className="field"><span>Endpoint URL</span><input name="url" required type="url" placeholder="https://example.com/prifyn/webhook" /></label><label className="field"><span>Events</span><input name="events" placeholder="*, report_schedule.sent, lead.created" defaultValue="*" /></label><button className="button button-dark" type="submit"><LinkSimple /> Add webhook</button></form>{secret && <div className="webhook-secret"><strong>Signing secret</strong><code>{secret}</code><small>Copy now. PRIFYN will not show this secret again.</small></div>}<div className="webhook-list">{webhooks.map(item => <article key={item.id}><div><strong>{item.name}</strong><span>{item.url}</span><small>{item.events.join(", ")} · {item.lastDeliveredAt ? `last sent ${new Date(item.lastDeliveredAt).toLocaleString("en-GB")}` : "waiting for event"}</small></div><b>{item.status}</b></article>)}</div></section></div>{notice && <div className="toast" role="status"><CheckCircle weight="fill" />{notice}</div>}</div>;
}
