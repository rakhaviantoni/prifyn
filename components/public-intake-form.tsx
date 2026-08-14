"use client";

import { ArrowRight, CheckCircle, CalendarCheck, ClipboardText } from "@phosphor-icons/react";
import { useState } from "react";

type IntakeType = "appointment" | "application";

const channels = ["Ads", "KOL / Creator", "Both Ads + KOL", "Reporting only", "Not sure yet"];
const urgency = ["This week", "This month", "Exploring", "Already running campaigns"];

export function PublicIntakeForm({ type }: { type: IntakeType }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAppointment = type === "appointment";

  async function submit(form: FormData) {
    const entries = Object.fromEntries(form.entries());
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/public/intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type,
          name: entries.name,
          email: entries.email,
          company: entries.company,
          role: entries.role,
          channel: entries.channel,
          urgency: entries.urgency,
          spend: entries.spend,
          preferredTime: entries.preferredTime,
          problem: entries.problem,
        }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Request could not be saved.");
      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Request could not be saved.");
    } finally {
      setSubmitting(false);
    }
  }

  return <section className="surface public-intake-card">
    <div className="intake-form-head">
      <span>{isAppointment ? <CalendarCheck weight="duotone" /> : <ClipboardText weight="duotone" />}</span>
      <div><small>{isAppointment ? "Guided onboarding" : "Apply online"}</small><h2>{isAppointment ? "Book a PRIFYN walkthrough" : "Tell us what you want PRIFYN to help with first"}</h2><p>{isAppointment ? "Best if you want someone to map your campaign, creator, report, and lead follow-up flow before setup." : "Best if you already know the campaign or channel problem and want PRIFYN to recommend the right first step."}</p></div>
    </div>
    <form className="public-intake-form" action={submit}>
      <div className="field-row"><label className="field"><span>Name</span><input name="name" required placeholder="Your name" /></label><label className="field"><span>Work email</span><input name="email" required type="email" placeholder="you@company.com" /></label></div>
      <div className="field-row"><label className="field"><span>Company / brand</span><input name="company" required placeholder="Brand or agency name" /></label><label className="field"><span>Role</span><input name="role" placeholder="Owner, marketer, agency, creator manager..." /></label></div>
      <div className="field-row"><label className="field"><span>Primary channel</span><select name="channel" defaultValue="Both Ads + KOL">{channels.map(item => <option key={item}>{item}</option>)}</select></label><label className="field"><span>Timing</span><select name="urgency" defaultValue={isAppointment ? "This week" : "This month"}>{urgency.map(item => <option key={item}>{item}</option>)}</select></label></div>
      <label className="field"><span>Monthly campaign spend</span><input name="spend" placeholder="e.g. Rp20m–Rp100m, or not sure yet" /></label>
      {isAppointment && <label className="field"><span>Preferred time</span><input name="preferredTime" placeholder="e.g. Tue/Thu afternoon WIB" /></label>}
      <label className="field"><span>Main problem</span><textarea name="problem" required placeholder="Example: we run Meta Ads and KOL manually, but reports are late and we cannot see which campaign creates leads/orders." /></label>
      <button className="button button-dark button-large" type="submit" disabled={submitting || submitted}>{submitted ? "Saved" : submitting ? "Saving…" : isAppointment ? "Book appointment" : "Submit application"} <ArrowRight weight="bold" /></button>
    </form>
    {submitted && <div className="intake-success" role="status"><CheckCircle weight="fill" /><span><strong>Request received.</strong><small>PRIFYN will review your current flow and follow up with the best next step.</small></span></div>}
    {error && <div className="intake-success error" role="alert"><ClipboardText weight="fill" /><span><strong>Could not save request.</strong><small>{error}</small></span></div>}
  </section>;
}
