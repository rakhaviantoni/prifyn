"use client";

import { ArrowClockwise, CalendarBlank, ChartLineUp, CheckCircle, ClipboardText, Database, EnvelopeSimple, Funnel, Lightning, PlugsConnected, Plus, Sparkle, UsersThree } from "@phosphor-icons/react";
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
};

type ImportItem = { id: string; sourceType: string; status: string; acceptedRows: number; totalRows: number; brand: string; createdAt: string };
type Metrics = { users: number; workspaces: number; operatingBrands: number; leads: number; imports: number; webhooks: number };
type Overview = { metrics: Metrics; leads: Lead[]; imports: ImportItem[] };
type AppointmentSlot = { id: string; label: string; availableDate: string; startTime: string; endTime: string; timezone: string; note: string; status: string; sortOrder: number };

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
              </div>
              <div className="admin-actions">
                <a className="button button-dark" href={`mailto:${selected.email}`}><EnvelopeSimple /> Email client</a>
                <button className="button button-outline" type="button" onClick={() => updateStage(selected.id, "approval_requested")}><Lightning /> Ask approval</button>
                <button className="button button-outline" type="button" onClick={() => updateStage(selected.id, "internal_brief")}><ClipboardText /> Prepare brief</button>
              </div>
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
                const daySlots = slots.filter(slot => !slot.availableDate || slot.availableDate === day.date);
                return (
                <article key={day.date}>
                  <header>
                    <strong>{day.day}</strong>
                    <span>{day.label}</span>
                  </header>
                  <div className="admin-calendar-grid">
                    {slotsLoading ? (
                      <small>Loading…</small>
                    ) : daySlots.length ? (
                      daySlots.map(slot => (
                        <button key={`${day.date}-${slot.id}`} type="button" className={slot.status === "active" ? "active" : ""} onClick={() => toggleSlot(slot)}>
                          <b>{slot.startTime}</b>
                          <span>{slot.endTime}</span>
                          <small>{slot.label}</small>
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

            <div className="admin-slot-list">
              {slots.length ? slots.map(slot => (
                <article key={slot.id}>
                  <div>
                    <strong>{slot.label}</strong>
                    <small>{slot.availableDate || "Weekly"} · {slot.startTime}–{slot.endTime} · {slot.timezone}</small>
                    <em>{slot.note || "Shown as an available walkthrough window."}</em>
                  </div>
                  <button type="button" className={slot.status === "active" ? "active" : ""} onClick={() => toggleSlot(slot)}>
                    {slot.status === "active" ? "Active" : "Paused"}
                  </button>
                </article>
              )) : null}
            </div>

            <form className="admin-slot-form" onSubmit={createSlot}>
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
              <button className="button button-outline" type="submit"><Plus /> Add availability</button>
            </form>
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
