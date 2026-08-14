"use client";

import { ArrowRight, CalendarBlank, CheckCircle, Clock, ClipboardText, Lightning, Megaphone, UsersThree } from "@phosphor-icons/react";
import { useState } from "react";

type IntakeType = "appointment" | "application";

const channels = [
  { value: "Both Ads + KOL", label: "Ads + KOL", copy: "Campaigns, creators, reports, and leads together.", icon: Lightning },
  { value: "Ads", label: "Paid ads", copy: "Meta, TikTok, Google, marketplace ads, or exports.", icon: Megaphone },
  { value: "KOL / Creator", label: "KOL / Creator", copy: "Briefs, creator screening, submissions, and proof.", icon: UsersThree },
  { value: "Reporting only", label: "Reports", copy: "Turn existing exports into decisions and next actions.", icon: ClipboardText },
];
const urgency = ["This week", "This month", "Already running campaigns", "Exploring"];
const appointmentSlots = [
  { value: "Morning walkthrough · 09:00–11:00 WIB", title: "Morning", time: "09:00–11:00 WIB", note: "Best for owner-led teams" },
  { value: "Midday walkthrough · 12:00–14:00 WIB", title: "Midday", time: "12:00–14:00 WIB", note: "Quick campaign mapping" },
  { value: "Afternoon walkthrough · 15:00–17:00 WIB", title: "Afternoon", time: "15:00–17:00 WIB", note: "Best for team review" },
];

export function PublicIntakeForm({ type }: { type: IntakeType }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState(appointmentSlots[0].value);
  const [customTime, setCustomTime] = useState("");
  const isAppointment = type === "appointment";

  async function submit(form: FormData) {
    const entries = Object.fromEntries(form.entries());
    const preferredTime = isAppointment ? customTime.trim() || selectedSlot : undefined;
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
          preferredTime,
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
      <span>{isAppointment ? <CalendarBlank weight="duotone" /> : <ClipboardText weight="duotone" />}</span>
      <div><small>{isAppointment ? "Guided onboarding" : "Apply online"}</small><h2>{isAppointment ? "Choose a walkthrough window" : "Share the growth problem"}</h2><p>{isAppointment ? "Pick a preferred window, then tell us what needs to be mapped before setup." : "Tell us the current mess: campaign setup, KOL ops, report uploads, leads, or attribution."}</p></div>
    </div>
    <div className="intake-progress" aria-hidden="true"><span className="active">Contact</span><i /><span>Growth flow</span><i /><span>{isAppointment ? "Time" : "Problem"}</span></div>
    <form className="public-intake-form" action={submit}>
      <fieldset className="intake-fieldset"><legend>Your details</legend><div className="field-row"><label className="field"><span>Name</span><input name="name" required placeholder="Your name" /></label><label className="field"><span>Work email</span><input name="email" required type="email" placeholder="you@company.com" /></label></div><div className="field-row"><label className="field"><span>Company / brand</span><input name="company" required placeholder="Brand or agency name" /></label><label className="field"><span>Your role</span><input name="role" placeholder="Owner, marketer, agency, creator manager..." /></label></div></fieldset>
      <fieldset className="intake-fieldset"><legend>What should we help with first?</legend><div className="intake-choice-grid">{channels.map(({ value, label, copy, icon: Icon }, index) => <label className="intake-choice" key={value}><input type="radio" name="channel" value={value} defaultChecked={index === 0} /><span><Icon weight="duotone" /><strong>{label}</strong><small>{copy}</small></span></label>)}</div></fieldset>
      <fieldset className="intake-fieldset"><legend>Readiness</legend><div className="field-row"><label className="field"><span>Timing</span><select name="urgency" defaultValue={isAppointment ? "This week" : "This month"}>{urgency.map(item => <option key={item}>{item}</option>)}</select></label><label className="field"><span>Monthly campaign spend</span><input name="spend" placeholder="e.g. Rp20m–Rp100m, or not sure yet" /></label></div></fieldset>
      {isAppointment && <fieldset className="intake-fieldset"><legend>Preferred walkthrough time</legend><div className="appointment-slots">{appointmentSlots.map(slot => <button className={selectedSlot === slot.value && !customTime ? "selected" : ""} type="button" key={slot.value} onClick={() => { setSelectedSlot(slot.value); setCustomTime(""); }}><CalendarBlank weight="duotone" /><span><strong>{slot.title}</strong><small><Clock />{slot.time}</small><em>{slot.note}</em></span></button>)}</div><label className="field custom-time-field"><span>Need another time?</span><input value={customTime} onChange={event => setCustomTime(event.target.value)} placeholder="Example: Tuesday or Thursday afternoon WIB" /></label></fieldset>}
      <label className="field problem-field"><span>{isAppointment ? "What should we map during the walkthrough?" : "What problem should PRIFYN review first?"}</span><textarea name="problem" required placeholder="Example: we run Meta Ads and KOL manually, but reports are late and we cannot see which campaign creates leads/orders." /></label>
      <button className="button button-dark button-large intake-submit" type="submit" disabled={submitting || submitted}>{submitted ? "Request saved" : submitting ? "Saving request…" : isAppointment ? "Request walkthrough" : "Send application"} <ArrowRight weight="bold" /></button>
    </form>
    {submitted && <div className="intake-success" role="status"><CheckCircle weight="fill" /><span><strong>{isAppointment ? "Walkthrough request received." : "Application received."}</strong><small>PRIFYN will review your current flow and follow up with the best next step.</small></span></div>}
    {error && <div className="intake-success error" role="alert"><ClipboardText weight="fill" /><span><strong>Could not save request.</strong><small>{error}</small></span></div>}
  </section>;
}
