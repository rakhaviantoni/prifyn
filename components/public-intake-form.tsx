"use client";

import { ArrowRight, CheckCircle, CalendarCheck, ClipboardText } from "@phosphor-icons/react";
import { useState } from "react";

type IntakeType = "appointment" | "application";

const channels = ["Ads", "KOL / Creator", "Both Ads + KOL", "Reporting only", "Not sure yet"];
const urgency = ["This week", "This month", "Exploring", "Already running campaigns"];

export function PublicIntakeForm({ type }: { type: IntakeType }) {
  const [submitted, setSubmitted] = useState(false);
  const isAppointment = type === "appointment";

  function submit(form: FormData) {
    const entries = Object.fromEntries(form.entries());
    const subject = isAppointment ? "PRIFYN appointment request" : "PRIFYN Growth OS application";
    const body = [
      subject,
      "",
      `Name: ${entries.name ?? ""}`,
      `Email: ${entries.email ?? ""}`,
      `Company / Brand: ${entries.company ?? ""}`,
      `Role: ${entries.role ?? ""}`,
      `Primary channel: ${entries.channel ?? ""}`,
      `Urgency: ${entries.urgency ?? ""}`,
      `Monthly campaign spend: ${entries.spend ?? ""}`,
      `Main problem: ${entries.problem ?? ""}`,
      `Preferred time: ${entries.preferredTime ?? ""}`,
    ].join("\n");
    const mailto = `mailto:hello@prifyn.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
    window.location.href = mailto;
  }

  return <section className="surface public-intake-card">
    <div className="intake-form-head">
      <span>{isAppointment ? <CalendarCheck weight="duotone" /> : <ClipboardText weight="duotone" />}</span>
      <div><small>{isAppointment ? "Guided onboarding" : "Apply online"}</small><h2>{isAppointment ? "Book a Growth OS walkthrough" : "Tell us what you want PRIFYN to operate first"}</h2><p>{isAppointment ? "Best if you want a human to map your campaign, reporting, and data flow before creating a workspace." : "Best if you already know your campaign/channel problem and want PRIFYN to prepare the right starting workspace."}</p></div>
    </div>
    <form className="public-intake-form" action={submit}>
      <div className="field-row"><label className="field"><span>Name</span><input name="name" required placeholder="Your name" /></label><label className="field"><span>Work email</span><input name="email" required type="email" placeholder="you@company.com" /></label></div>
      <div className="field-row"><label className="field"><span>Company / brand</span><input name="company" required placeholder="Brand or agency name" /></label><label className="field"><span>Role</span><input name="role" placeholder="Owner, marketer, agency, creator manager..." /></label></div>
      <div className="field-row"><label className="field"><span>Primary channel</span><select name="channel" defaultValue="Both Ads + KOL">{channels.map(item => <option key={item}>{item}</option>)}</select></label><label className="field"><span>Timing</span><select name="urgency" defaultValue={isAppointment ? "This week" : "This month"}>{urgency.map(item => <option key={item}>{item}</option>)}</select></label></div>
      <label className="field"><span>Monthly campaign spend</span><input name="spend" placeholder="e.g. Rp20m–Rp100m, or not sure yet" /></label>
      {isAppointment && <label className="field"><span>Preferred time</span><input name="preferredTime" placeholder="e.g. Tue/Thu afternoon WIB" /></label>}
      <label className="field"><span>Main problem</span><textarea name="problem" required placeholder="Example: we run Meta Ads and KOL manually, but reports are late and we cannot see which campaign creates leads/orders." /></label>
      <button className="button button-dark button-large" type="submit">{isAppointment ? "Prepare appointment request" : "Submit application"} <ArrowRight weight="bold" /></button>
    </form>
    {submitted && <div className="intake-success" role="status"><CheckCircle weight="fill" /><span><strong>Request prepared.</strong><small>Your email app should open with the details. Send it to continue.</small></span></div>}
  </section>;
}
