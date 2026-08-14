"use client";

import { ArrowClockwise, CalendarBlank, ChartLineUp, CheckCircle, ClipboardText, Database, EnvelopeSimple, Funnel, Lightning, PencilSimple, PlugsConnected, Plus, Sparkle, X, UsersThree } from "@phosphor-icons/react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { adminOrderStages, stageLabel } from "@/lib/admin/order-flow";

type Lead = {
  id: string;
  status: string;
  source: string;
  company: string;
  contact: string;
  email: string;
  brand: string;
  workspace: string;
  createdAt: string;
  channel: string;
  urgency: string;
  spend: string;
  problem: string;
  preferredTime?: string;
  meetingDate?: string;
  meetingTime?: string;
  meetingOwnerName?: string;
  meetingOwnerEmail?: string;
  meetingStatus?: string;
  meetingOutcome?: string;
  meetingNextStep?: string;
};

type ImportItem = { id: string; sourceType: string; status: string; acceptedRows: number; totalRows: number; brand: string; createdAt: string };
type Metrics = { users: number; workspaces: number; operatingBrands: number; leads: number; imports: number; webhooks: number };
type Overview = { metrics: Metrics; leads: Lead[]; imports: ImportItem[] };
type AppointmentSlot = {
  id: string;
  label: string;
  availableDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  note: string;
  durationMinutes: number;
  bufferMinutes: number;
  maxBookingsPerDay: number;
  ownerName: string;
  ownerEmail: string;
  meetingLocation: string;
  status: string;
  sortOrder: number;
};
type BlackoutDate = { id: string; date: string; reason: string | null; status: string };

const opsFlow = [
  { title: "Lead captured", stage: "intake_received", copy: "A book/apply request enters the PRIFYN queue." },
  { title: "Discovery", stage: "meeting_scheduled", copy: "Confirm goals, channels, timing, and decision maker." },
  { title: "Approval", stage: "approval_requested", copy: "Send the plan back and wait for client approval." },
  { title: "Media plan", stage: "media_plan", copy: "Map budget, channels, offers, creator needs, and KPIs." },
  { title: "Internal brief", stage: "internal_brief", copy: "Turn client notes into a clear execution brief." },
  { title: "Campaign ops", stage: "campaign_running", copy: "Run ads/KOL work and keep progress visible." },
  { title: "Report prep", stage: "report_ready", copy: "Upload exports, normalize metrics, and prepare insights." },
  { title: "Review", stage: "client_review", copy: "Share next decisions for the next growth cycle." },
];

function toLocalDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getUpcomingBusinessDays() {
  const days: Array<{ date: string; day: string; label: string }> = [];
  const cursor = new Date();
  while (days.length < 5) {
    const weekday = cursor.getDay();
    if (weekday >= 1 && weekday <= 5) {
      days.push({
        date: toLocalDateInputValue(cursor),
        day: cursor.toLocaleDateString("en-US", { weekday: "short" }),
        label: cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function AdminBusinessManager({ metrics, leads, imports, loadOverview = false }: {
  metrics: Metrics;
  leads: Lead[];
  imports: ImportItem[];
  loadOverview?: boolean;
}) {
  const [metricState, setMetricState] = useState(metrics);
  const [rows, setRows] = useState(leads);
  const [importRows, setImportRows] = useState(imports);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<Lead | null>(leads[0] ?? null);
  const [overviewLoading, setOverviewLoading] = useState(loadOverview);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [blackouts, setBlackouts] = useState<BlackoutDate[]>([]);
  const [blackoutsLoading, setBlackoutsLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<AppointmentSlot | null>(null);

  async function loadBusinessOverview(showNotice = false) {
    setOverviewLoading(true);
    if (showNotice) setNotice("Refreshing PRIFYN ops data…");
    const response = await fetch("/api/admin/overview", { credentials: "include" });
    const data = await response.json().catch(() => ({})) as { ok?: boolean; overview?: Overview; error?: string };
    if (response.ok && data.overview) {
      setMetricState(data.overview.metrics);
      setRows(data.overview.leads);
      setSelected(data.overview.leads[0] ?? null);
      setImportRows(data.overview.imports);
      setOverviewLoading(false);
      if (showNotice) {
        setNotice("Ops data refreshed.");
        window.setTimeout(() => setNotice(null), 2600);
      }
    } else {
      setNotice(data.error || "PRIFYN ops data could not be loaded yet.");
      setOverviewLoading(false);
      window.setTimeout(() => setNotice(null), 3600);
    }
  }

  useEffect(() => {
    if (!loadOverview) return;
    let active = true;
    void (async () => {
      setOverviewLoading(true);
      const response = await fetch("/api/admin/overview", { credentials: "include" });
      const data = await response.json().catch(() => ({})) as { ok?: boolean; overview?: Overview; error?: string };
      if (!active) return;
      if (response.ok && data.overview) {
        setMetricState(data.overview.metrics);
        setRows(data.overview.leads);
        setSelected(data.overview.leads[0] ?? null);
        setImportRows(data.overview.imports);
        setOverviewLoading(false);
      } else {
        setNotice(data.error || "PRIFYN ops data could not be loaded yet.");
        setOverviewLoading(false);
        window.setTimeout(() => setNotice(null), 3600);
      }
    })();
    return () => { active = false; };
  }, [loadOverview]);

  async function loadSlots() {
    setSlotsLoading(true);
    const response = await fetch("/api/admin/appointment-slots", { credentials: "include" });
    const data = await response.json().catch(() => ({})) as { slots?: AppointmentSlot[]; error?: string };
    if (response.ok) setSlots(data.slots ?? []);
    else setNotice(data.error || "Availability could not be loaded.");
    setSlotsLoading(false);
  }

  async function loadBlackouts() {
    setBlackoutsLoading(true);
    const response = await fetch("/api/admin/blackout-dates", { credentials: "include" });
    const data = await response.json().catch(() => ({})) as { dates?: BlackoutDate[]; error?: string };
    if (response.ok) setBlackouts(data.dates ?? []);
    else setNotice(data.error || "Blackout dates could not be loaded.");
    setBlackoutsLoading(false);
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      const response = await fetch("/api/admin/appointment-slots", { credentials: "include" });
      const data = await response.json().catch(() => ({})) as { slots?: AppointmentSlot[]; error?: string };
      if (!active) return;
      if (response.ok) setSlots(data.slots ?? []);
      else setNotice(data.error || "Availability could not be loaded.");
      setSlotsLoading(false);
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const response = await fetch("/api/admin/blackout-dates", { credentials: "include" });
      const data = await response.json().catch(() => ({})) as { dates?: BlackoutDate[]; error?: string };
      if (!active) return;
      if (response.ok) setBlackouts(data.dates ?? []);
      else setNotice(data.error || "Blackout dates could not be loaded.");
      setBlackoutsLoading(false);
    })();
    return () => { active = false; };
  }, []);

  async function createSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setNotice("Adding walkthrough slot…");
    const response = await fetch("/api/admin/appointment-slots", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        label: form.get("label"),
        startTime: form.get("startTime"),
        endTime: form.get("endTime"),
        note: form.get("note"),
        availableDate: form.get("availableDate"),
        durationMinutes: form.get("durationMinutes"),
        bufferMinutes: form.get("bufferMinutes"),
        maxBookingsPerDay: form.get("maxBookingsPerDay"),
        ownerName: form.get("ownerName"),
        ownerEmail: form.get("ownerEmail"),
        meetingLocation: form.get("meetingLocation"),
        status: "active",
        sortOrder: slots.length ? Math.max(...slots.map(slot => slot.sortOrder)) + 10 : 10,
      }),
    });
    if (response.ok) {
      event.currentTarget.reset();
      await loadSlots();
      setNotice("Walkthrough slot added.");
    } else {
      const data = await response.json().catch(() => ({})) as { error?: string };
      setNotice(data.error || "Slot could not be added.");
    }
    window.setTimeout(() => setNotice(null), 2600);
  }

  async function updateSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingSlot) return;
    const form = new FormData(event.currentTarget);
    setNotice("Saving availability…");
    const response = await fetch(`/api/admin/appointment-slots/${editingSlot.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        label: form.get("label"),
        availableDate: form.get("availableDate"),
        startTime: form.get("startTime"),
        endTime: form.get("endTime"),
        note: form.get("note"),
        durationMinutes: form.get("durationMinutes"),
        bufferMinutes: form.get("bufferMinutes"),
        maxBookingsPerDay: form.get("maxBookingsPerDay"),
        ownerName: form.get("ownerName"),
        ownerEmail: form.get("ownerEmail"),
        meetingLocation: form.get("meetingLocation"),
      }),
    });
    if (response.ok) {
      setEditingSlot(null);
      await loadSlots();
      setNotice("Availability updated.");
    } else {
      const data = await response.json().catch(() => ({})) as { error?: string };
      setNotice(data.error || "Availability could not be updated.");
    }
    window.setTimeout(() => setNotice(null), 2600);
  }

  async function createBlackout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setNotice("Blocking date…");
    const response = await fetch("/api/admin/blackout-dates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ date: form.get("date"), reason: form.get("reason") }),
    });
    if (response.ok) {
      event.currentTarget.reset();
      await loadBlackouts();
      setNotice("Date blocked.");
    } else {
      const data = await response.json().catch(() => ({})) as { error?: string };
      setNotice(data.error || "Date could not be blocked.");
    }
    window.setTimeout(() => setNotice(null), 2600);
  }

  async function toggleBlackout(date: BlackoutDate) {
    const status = date.status === "active" ? "paused" : "active";
    setNotice(status === "active" ? "Blocking date…" : "Opening date…");
    const response = await fetch(`/api/admin/blackout-dates/${date.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      await loadBlackouts();
      setNotice(status === "active" ? "Date blocked." : "Date opened.");
    } else {
      setNotice("Date could not be updated.");
    }
    window.setTimeout(() => setNotice(null), 2600);
  }

  async function saveMeetingOutcome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    setNotice("Saving meeting notes…");
    const response = await fetch(`/api/admin/leads/${selected.id}/meeting`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ownerName: form.get("ownerName"),
        ownerEmail: form.get("ownerEmail"),
        meetingStatus: form.get("meetingStatus"),
        outcome: form.get("outcome"),
        nextStep: form.get("nextStep"),
      }),
    });
    if (response.ok) {
      setNotice("Meeting notes saved.");
      await loadBusinessOverview(false);
    } else {
      const data = await response.json().catch(() => ({})) as { error?: string };
      setNotice(data.error || "Meeting notes could not be saved.");
    }
    window.setTimeout(() => setNotice(null), 2600);
  }

  async function toggleSlot(slot: AppointmentSlot) {
    const status = slot.status === "active" ? "paused" : "active";
    setNotice(status === "active" ? "Reactivating slot…" : "Pausing slot…");
    const response = await fetch(`/api/admin/appointment-slots/${slot.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      await loadSlots();
      setNotice(status === "active" ? "Slot is active." : "Slot paused.");
    } else {
      setNotice("Slot could not be updated.");
    }
    window.setTimeout(() => setNotice(null), 2600);
  }

  async function updateStage(leadId: string, status: string) {
    setNotice("Updating order stage…");
    const response = await fetch(`/api/admin/leads/${leadId}/stage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status, note: "Updated from PRIFYN Business Manager." }),
    });
    const data = await response.json().catch(() => ({})) as { error?: string; lead?: { status: string } };
    if (!response.ok || !data.lead) {
      setNotice(data.error || "Stage could not be updated.");
    } else {
      setRows(current => current.map(item => item.id === leadId ? { ...item, status: data.lead!.status } : item));
      setSelected(current => current?.id === leadId ? { ...current, status: data.lead!.status } : current);
      setNotice("Order stage updated.");
    }
    window.setTimeout(() => setNotice(null), 2600);
  }

  const metricCards = [
    { label: "Accounts", value: metricState.users, icon: UsersThree },
    { label: "Client workspaces", value: metricState.workspaces, icon: ClipboardText },
    { label: "Brands", value: metricState.operatingBrands, icon: Sparkle },
    { label: "Open requests", value: metricState.leads, icon: Funnel },
    { label: "Report uploads", value: metricState.imports, icon: Database },
    { label: "Automations", value: metricState.webhooks, icon: PlugsConnected },
  ];

  const activeSlots = slots.filter(slot => slot.status === "active").length;
  const calendarDays = getUpcomingBusinessDays();
  const recurringSlots = slots.filter(slot => !slot.availableDate);
  const datedSlots = slots.filter(slot => slot.availableDate);
  const activeBlackoutDates = new Set(blackouts.filter(date => date.status === "active").map(date => date.date));

  return (
    <div className="admin-page">
      <header className="admin-hero">
        <div>
          <span>PRIFYN Ops Desk</span>
          <h1>Every client request, one clear next move.</h1>
          <p>Follow up with new leads, schedule discovery calls, confirm approvals, prepare briefs, and review campaign results from one internal workspace.</p>
        </div>
        <div className="admin-hero-actions">
          <button className="button button-light" type="button" onClick={() => loadBusinessOverview(true)} disabled={overviewLoading}>
            <ArrowClockwise />
            {overviewLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {overviewLoading && (
        <section className="surface admin-loading">
          <Database weight="duotone" />
          <div>
            <strong>Loading the latest desk activity…</strong>
            <span>Requests, uploads, and account activity will appear here as soon as they are ready.</span>
          </div>
        </section>
      )}

      <section className="admin-metrics">
        {metricCards.map(({ label, value, icon: Icon }) => (
          <article className="surface" key={label}>
            <Icon weight="duotone" />
            <span><strong>{value}</strong>{label}</span>
          </article>
        ))}
      </section>

      <section className="surface admin-flow">
        <div className="admin-flow-head">
          <span>Client operating flow</span>
          <strong>From first request to repeat growth review.</strong>
          <p>Each stage points the PRIFYN team to the next action: follow up, schedule, request approval, brief the operator, prepare the report, or review the next cycle.</p>
        </div>
        <div className="admin-flow-timeline">
          {opsFlow.map((step, index) => (
            <article key={step.stage} className={index === 0 ? "current" : ""}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <div>
                <strong>{step.title}</strong>
                <span>{stageLabel(step.stage)}</span>
                <p>{step.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="admin-grid">
        <section className="surface admin-table">
          <div className="surface-head">
            <div>
              <h2>Client requests</h2>
              <span>{overviewLoading ? "Loading recent requests…" : rows.length ? `${rows.length} active request${rows.length === 1 ? "" : "s"}` : "Ready for new leads"}</span>
            </div>
            <button className="button button-outline" type="button" onClick={() => loadBusinessOverview(true)} disabled={overviewLoading}>
              <ArrowClockwise />
              Refresh
            </button>
          </div>

          {rows.length ? (
            <div className="admin-lead-list">
              {rows.map(lead => (
                <article key={lead.id} className={selected?.id === lead.id ? "selected" : ""}>
                  <button type="button" onClick={() => setSelected(lead)}>
                    <strong>{lead.company}</strong>
                    <span>{lead.contact} · {lead.email}</span>
                    <small>{lead.channel || lead.source} · {lead.spend || "Spend not shared yet"}</small>
                  </button>
                  <select value={lead.status} aria-label={`Stage for ${lead.company}`} onChange={event => updateStage(lead.id, event.target.value)}>
                    {adminOrderStages.map(stage => <option value={stage} key={stage}>{stageLabel(stage)}</option>)}
                  </select>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty-inbox">
              <div>
                <Funnel weight="duotone" />
                <h2>{overviewLoading ? "Preparing requests…" : "No client requests yet"}</h2>
                <p>{overviewLoading ? "The latest requests are loading." : "When someone books a call or applies online, the request lands here with the next PRIFYN action."}</p>
              </div>
              <div className="admin-empty-actions">
                <Link className="button button-dark" href="/book">Open booking page</Link>
                <Link className="button button-outline" href="/apply">Open apply page</Link>
                <button className="button button-outline" type="button" onClick={() => loadBusinessOverview(true)}>Refresh inbox</button>
              </div>
            </div>
          )}
        </section>

        <aside className="admin-side">
          {selected && (
            <section className="surface admin-detail">
              <span className="section-kicker">Selected request</span>
              <h2>{selected.company}</h2>
              <p>{selected.problem || "No problem statement yet."}</p>
              <div className="admin-detail-grid">
                <div><span>Contact</span><strong>{selected.contact}</strong><small>{selected.email}</small></div>
                <div><span>Current step</span><strong>{stageLabel(selected.status)}</strong></div>
                <div><span>Client setup</span><strong>{selected.workspace}</strong><small>{selected.brand}</small></div>
                <div><span>Urgency</span><strong>{selected.urgency || "Not shared"}</strong></div>
                <div><span>Meeting</span><strong>{selected.meetingDate || "Not scheduled"}</strong><small>{selected.meetingTime || selected.preferredTime || "No time selected"}</small></div>
              </div>
              <div className="admin-actions">
                <a className="button button-dark" href={`mailto:${selected.email}`}><EnvelopeSimple /> Email client</a>
                <button className="button button-outline" type="button" onClick={() => updateStage(selected.id, "approval_requested")}><Lightning /> Ask approval</button>
                <button className="button button-outline" type="button" onClick={() => updateStage(selected.id, "internal_brief")}><ClipboardText /> Prepare brief</button>
              </div>
              <form className="admin-meeting-form" key={selected.id} onSubmit={saveMeetingOutcome}>
                <div className="admin-meeting-title">
                  <CalendarBlank weight="duotone" />
                  <span><strong>Meeting owner & outcome</strong><small>Keep the handoff clear after every discovery or review call.</small></span>
                </div>
                <div className="admin-slot-form-row">
                  <label><span>PRIFYN owner</span><input name="ownerName" defaultValue={selected.meetingOwnerName || ""} placeholder="e.g. Rakha / Growth Ops" /></label>
                  <label><span>Owner email</span><input name="ownerEmail" type="email" defaultValue={selected.meetingOwnerEmail || ""} placeholder="owner@prifyn.com" /></label>
                </div>
                <label><span>Meeting status</span><select name="meetingStatus" defaultValue={selected.meetingStatus || "scheduled"}><option value="requested">Requested</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="reschedule_needed">Reschedule needed</option><option value="cancelled">Cancelled</option></select></label>
                <label><span>Outcome notes</span><textarea name="outcome" defaultValue={selected.meetingOutcome || ""} placeholder="What did we learn? What is the client trying to fix first?" /></label>
                <label><span>Next step</span><input name="nextStep" defaultValue={selected.meetingNextStep || ""} placeholder="e.g. prepare media plan, ask for exports, send proposal" /></label>
                <button className="button button-outline" type="submit"><CheckCircle weight="fill" /> Save meeting notes</button>
              </form>
            </section>
          )}

          <section className="surface admin-detail admin-slots">
            <div className="surface-head">
              <div>
                <h2><CalendarBlank /> Walkthrough calendar</h2>
                <span>{activeSlots} active window{activeSlots === 1 ? "" : "s"} shown on the booking page</span>
              </div>
              <button type="button" onClick={() => loadSlots()}><ArrowClockwise /> Refresh</button>
            </div>

            <div className="admin-calendar-board" aria-label="Recurring walkthrough availability">
              {calendarDays.map((day, index) => {
                const daySlots = datedSlots.filter(slot => slot.availableDate === day.date);
                const isBlocked = activeBlackoutDates.has(day.date);
                return (
                <article key={day.date} className={isBlocked ? "blocked" : ""}>
                  <header>
                    <span>{day.day}</span>
                    <strong>{day.label}</strong>
                    {isBlocked && <em>Blocked</em>}
                  </header>
                  <div className="admin-calendar-grid">
                    {slotsLoading ? (
                      <small>Loading…</small>
                    ) : isBlocked ? (
                      <small>This date is blocked from public booking.</small>
                    ) : daySlots.length ? (
                      daySlots.map(slot => (
                        <button key={`${day.date}-${slot.id}`} type="button" className={slot.status === "active" ? "active" : ""} onClick={() => setEditingSlot(slot)}>
                          <b>{slot.startTime}</b>
                          <span>{slot.endTime}</span>
                          <small>{slot.label} · {slot.durationMinutes}m</small>
                        </button>
                      ))
                    ) : index === 0 ? (
                      <small>Add your first time window below.</small>
                    ) : (
                      <small>No window yet</small>
                    )}
                  </div>
                </article>
                );
              })}
            </div>

            <div className="admin-recurring-strip">
              <div>
                <strong>Weekly windows</strong>
                <span>{recurringSlots.length ? `${recurringSlots.length} recurring option${recurringSlots.length === 1 ? "" : "s"} shown on open booking dates` : "No recurring windows yet"}</span>
              </div>
              <div>
                {recurringSlots.slice(0, 4).map(slot => (
                  <button key={slot.id} type="button" className={slot.status === "active" ? "active" : ""} onClick={() => setEditingSlot(slot)}>
                    <b>{slot.startTime}</b>
                    <span>{slot.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-slot-list">
              {slots.length ? slots.map(slot => (
                <article key={slot.id}>
                  <div>
                    <strong>{slot.label}</strong>
                    <small>{slot.availableDate || "Weekly"} · {slot.startTime}–{slot.endTime} · {slot.timezone}</small>
                    <em>{slot.durationMinutes} min call · {slot.bufferMinutes} min buffer · max {slot.maxBookingsPerDay}/day{slot.ownerName ? ` · ${slot.ownerName}` : ""}</em>
                  </div>
                  <div className="admin-slot-actions">
                    <button type="button" onClick={() => setEditingSlot(slot)}><PencilSimple /> Edit</button>
                    <button type="button" className={slot.status === "active" ? "active" : ""} onClick={() => toggleSlot(slot)}>
                      {slot.status === "active" ? "Active" : "Paused"}
                    </button>
                  </div>
                </article>
              )) : null}
            </div>

            {editingSlot && (
              <form className="admin-slot-form admin-edit-slot-form" key={editingSlot.id} onSubmit={updateSlot}>
                <div className="admin-form-headline">
                  <div><span>Edit availability</span><strong>{editingSlot.label}</strong></div>
                  <button type="button" onClick={() => setEditingSlot(null)}><X /> Cancel</button>
                </div>
                <label>
                  <span>Window label</span>
                  <input name="label" defaultValue={editingSlot.label} required />
                </label>
                <label>
                  <span>Date</span>
                  <input name="availableDate" type="date" defaultValue={editingSlot.availableDate || ""} />
                </label>
                <div className="admin-slot-form-row">
                  <label><span>Start</span><input name="startTime" type="time" defaultValue={editingSlot.startTime} required /></label>
                  <label><span>End</span><input name="endTime" type="time" defaultValue={editingSlot.endTime} required /></label>
                </div>
                <label><span>Booking note</span><input name="note" defaultValue={editingSlot.note || ""} placeholder="Best for owner-led teams" /></label>
                <div className="admin-slot-form-row">
                  <label><span>Duration</span><input name="durationMinutes" type="number" min="15" max="180" defaultValue={editingSlot.durationMinutes} /></label>
                  <label><span>Buffer</span><input name="bufferMinutes" type="number" min="0" max="120" defaultValue={editingSlot.bufferMinutes} /></label>
                </div>
                <label><span>Max bookings per day</span><input name="maxBookingsPerDay" type="number" min="1" max="20" defaultValue={editingSlot.maxBookingsPerDay} /></label>
                <div className="admin-slot-form-row">
                  <label><span>PRIFYN owner</span><input name="ownerName" defaultValue={editingSlot.ownerName || ""} placeholder="PRIFYN Growth Team" /></label>
                  <label><span>Owner email</span><input name="ownerEmail" type="email" defaultValue={editingSlot.ownerEmail || ""} placeholder="privynindonesia@gmail.com" /></label>
                </div>
                <label><span>Meeting location</span><input name="meetingLocation" defaultValue={editingSlot.meetingLocation || ""} placeholder="Google Meet invite follows by email" /></label>
                <button className="button button-dark" type="submit"><CheckCircle weight="fill" /> Save changes</button>
              </form>
            )}

            <form className="admin-slot-form" onSubmit={createSlot}>
              <div className="admin-form-headline">
                <div><span>New availability</span><strong>Add another booking window</strong></div>
              </div>
              <label>
                <span>Window label</span>
                <input name="label" placeholder="Morning walkthrough" required />
              </label>
              <label>
                <span>Date</span>
                <input name="availableDate" type="date" />
              </label>
              <div>
                <label>
                  <span>Start</span>
                  <input name="startTime" type="time" defaultValue="09:00" required />
                </label>
                <label>
                  <span>End</span>
                  <input name="endTime" type="time" defaultValue="11:00" required />
                </label>
              </div>
              <label>
                <span>Booking note</span>
                <input name="note" placeholder="Best for owner-led teams" />
              </label>
              <div className="admin-slot-form-row">
                <label><span>Duration</span><input name="durationMinutes" type="number" min="15" max="180" defaultValue="45" /></label>
                <label><span>Buffer</span><input name="bufferMinutes" type="number" min="0" max="120" defaultValue="15" /></label>
              </div>
              <label>
                <span>Max bookings per day</span>
                <input name="maxBookingsPerDay" type="number" min="1" max="20" defaultValue="4" />
              </label>
              <div className="admin-slot-form-row">
                <label><span>PRIFYN owner</span><input name="ownerName" placeholder="PRIFYN Growth Team" /></label>
                <label><span>Owner email</span><input name="ownerEmail" type="email" placeholder="privynindonesia@gmail.com" /></label>
              </div>
              <label>
                <span>Meeting location</span>
                <input name="meetingLocation" placeholder="Google Meet invite follows by email" />
              </label>
              <button className="button button-outline" type="submit"><Plus /> Add availability</button>
            </form>

            <div className="admin-blackouts">
              <div className="surface-head">
                <div>
                  <h2>Blackout dates</h2>
                  <span>Block holidays, travel days, or fully unavailable PRIFYN ops days.</span>
                </div>
                <button type="button" onClick={() => loadBlackouts()}><ArrowClockwise /> Refresh</button>
              </div>
              <form className="admin-slot-form compact" onSubmit={createBlackout}>
                <div className="admin-slot-form-row">
                  <label><span>Date</span><input name="date" type="date" required /></label>
                  <label><span>Reason</span><input name="reason" placeholder="Holiday, workshop, full day review..." /></label>
                </div>
                <button className="button button-outline" type="submit"><Plus /> Block date</button>
              </form>
              <div className="admin-slot-list">
                {blackoutsLoading ? <span>Loading blackout dates…</span> : blackouts.length ? blackouts.map(date => (
                  <article key={date.id}>
                    <div><strong>{date.date}</strong><small>{date.reason || "Unavailable"}</small><em>{date.status === "active" ? "Blocked from public booking" : "Open for booking"}</em></div>
                    <button type="button" className={date.status === "active" ? "active" : ""} onClick={() => toggleBlackout(date)}>{date.status === "active" ? "Blocked" : "Open"}</button>
                  </article>
                )) : <span>No blackout dates yet.</span>}
              </div>
            </div>
          </section>

          <section className="surface admin-detail">
            <div className="surface-head"><h2><ChartLineUp /> Latest uploaded reports</h2></div>
            <div className="campaign-mini-list">
              {importRows.length ? importRows.map(item => (
                <div className="campaign-mini" key={item.id}>
                  <i />
                  <div><strong>{item.sourceType}</strong><span>{item.brand} · {item.acceptedRows}/{item.totalRows} rows</span></div>
                  <b>{item.status}</b>
                </div>
              )) : (
                <div className="campaign-mini">
                  <i className="warning" />
                  <div><strong>{overviewLoading ? "Loading uploads…" : "No reports uploaded yet"}</strong><span>{overviewLoading ? "Recent client exports will appear shortly." : "Client exports appear here after they are uploaded."}</span></div>
                  <b>{overviewLoading ? "Loading" : "Waiting"}</b>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>

      {notice && <div className="toast" role="status"><CheckCircle weight="fill" />{notice}</div>}
    </div>
  );
}
