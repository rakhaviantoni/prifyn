"use client";

import { ArrowRight, CalendarBlank, CheckCircle, Clock, ClipboardText, Lightning, Megaphone, UsersThree } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type IntakeType = "appointment" | "application";

const channels = [
  { value: "Both Ads + KOL", label: "Ads + KOL", copy: "Campaigns, creators, reports, and leads together.", icon: Lightning },
  { value: "Ads", label: "Paid ads", copy: "Meta, TikTok, Google, marketplace ads, or exports.", icon: Megaphone },
  { value: "KOL / Creator", label: "KOL / Creator", copy: "Briefs, creator screening, submissions, and proof.", icon: UsersThree },
  { value: "Reporting only", label: "Reports", copy: "Turn existing exports into decisions and next actions.", icon: ClipboardText },
];
const urgency = ["This week", "This month", "Already running campaigns", "Exploring"];
type AppointmentSlot = {
  id: string;
  label: string;
  availableDate?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  note: string;
  durationMinutes?: number;
  bufferMinutes?: number;
  maxBookingsPerDay?: number;
  ownerName?: string;
  ownerEmail?: string;
  meetingLocation?: string;
  status: string;
  sortOrder: number;
};

const defaultAppointmentSlots: AppointmentSlot[] = [
  { id: "morning", label: "Morning", availableDate: "", startTime: "09:00", endTime: "11:00", timezone: "Asia/Jakarta", note: "Best for owner-led teams", status: "active", sortOrder: 10 },
  { id: "midday", label: "Midday", availableDate: "", startTime: "12:00", endTime: "14:00", timezone: "Asia/Jakarta", note: "Quick campaign mapping", status: "active", sortOrder: 20 },
  { id: "afternoon", label: "Afternoon", availableDate: "", startTime: "15:00", endTime: "17:00", timezone: "Asia/Jakarta", note: "Best for team review", status: "active", sortOrder: 30 },
];

function formatSlotDate(value?: string) {
  if (!value) return "Weekly window";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function PublicIntakeForm({ type }: { type: IntakeType }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState(defaultAppointmentSlots);
  const [selectedSlot, setSelectedSlot] = useState(defaultAppointmentSlots[0].id);
  const [customTime, setCustomTime] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const isAppointment = type === "appointment";
  const selectedSlotValue = slots.find(slot => slot.id === selectedSlot);

  useEffect(() => {
    if (!isAppointment) return;
    let active = true;
    void (async () => {
      const response = await fetch("/api/public/appointment-slots");
      const data = await response.json().catch(() => ({})) as { slots?: AppointmentSlot[] };
      if (!active || !response.ok || !data.slots?.length) return;
      setSlots(data.slots);
      setSelectedSlot(current => data.slots!.some(slot => slot.id === current) ? current : data.slots![0].id);
    })();
    return () => { active = false; };
  }, [isAppointment]);

  async function submit(form: FormData) {
    const entries = Object.fromEntries(form.entries());
    const canPersistSlot = selectedSlotValue?.id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(selectedSlotValue.id) : false;
    const preferredTime = isAppointment
      ? customTime.trim() || (selectedSlotValue ? `${selectedSlotValue.label} walkthrough · ${formatSlotDate(preferredDate || selectedSlotValue.availableDate)} · ${selectedSlotValue.startTime}–${selectedSlotValue.endTime} ${selectedSlotValue.timezone}` : undefined)
      : undefined;
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
          preferredDate: preferredDate || selectedSlotValue?.availableDate || undefined,
          selectedSlotId: canPersistSlot ? selectedSlotValue?.id : undefined,
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
      {isAppointment && <fieldset className="intake-fieldset"><legend>Preferred walkthrough time</legend><div className="booking-date-picker"><CalendarBlank weight="duotone" /><label className="field"><span>Preferred date</span><input type="date" value={preferredDate} onChange={event => setPreferredDate(event.target.value)} /></label></div><div className="appointment-slots">{slots.map(slot => <button className={selectedSlot === slot.id && !customTime ? "selected" : ""} type="button" key={slot.id} onClick={() => { setSelectedSlot(slot.id); setCustomTime(""); }}><CalendarBlank weight="duotone" /><span><strong>{slot.label}</strong><small><Clock />{formatSlotDate(slot.availableDate)} · {slot.startTime}–{slot.endTime}</small><em>{slot.durationMinutes ? `${slot.durationMinutes} min + ${slot.bufferMinutes ?? 0} min buffer` : slot.note || slot.timezone}</em></span></button>)}</div><label className="field custom-time-field"><span>Need another time?</span><input value={customTime} onChange={event => setCustomTime(event.target.value)} placeholder="Example: Tuesday or Thursday afternoon WIB" /></label></fieldset>}
      <label className="field problem-field"><span>{isAppointment ? "What should we map during the walkthrough?" : "What problem should PRIFYN review first?"}</span><textarea name="problem" required placeholder="Example: we run Meta Ads and KOL manually, but reports are late and we cannot see which campaign creates leads/orders." /></label>
      <button className="button button-dark button-large intake-submit" type="submit" disabled={submitting || submitted}>{submitted ? "Request saved" : submitting ? "Saving request…" : isAppointment ? "Request walkthrough" : "Send application"} <ArrowRight weight="bold" /></button>
    </form>
    {submitted && <div className="intake-success" role="status"><CheckCircle weight="fill" /><span><strong>{isAppointment ? "Walkthrough request received." : "Application received."}</strong><small>PRIFYN will review your current flow and follow up with the best next step.</small></span></div>}
    {error && <div className="intake-success error" role="alert"><ClipboardText weight="fill" /><span><strong>Could not save request.</strong><small>{error}</small></span></div>}
  </section>;
}
