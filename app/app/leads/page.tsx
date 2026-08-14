import { CalendarCheck, CheckCircle, ClipboardText, EnvelopeSimple, Funnel, UserCircle } from "@phosphor-icons/react/dist/ssr";
import { getLeadInbox } from "@/lib/lead-inbox";

function sourceLabel(source: string) {
  if (source === "book_appointment") return "Book appointment";
  if (source === "apply_online") return "Apply online";
  return source.replace(/_/g, " ");
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export default async function LeadsPage() {
  const leads = await getLeadInbox();
  const appointmentCount = leads.filter(item => item.source === "book_appointment").length;
  const applicationCount = leads.filter(item => item.source === "apply_online").length;
  return <div className="app-content leads-page"><header className="app-page-head"><div><span>Leads & attribution</span><h1>Lead Inbox</h1><p>Book appointment and Apply online submissions land here for follow-up and campaign attribution.</p></div><span className="status-pill"><CheckCircle weight="fill" /> {leads.length} lead{leads.length === 1 ? "" : "s"}</span></header>
    <section className="lead-kpi-grid"><article className="surface"><CalendarCheck weight="duotone" /><span><strong>{appointmentCount}</strong>appointment requests</span></article><article className="surface"><ClipboardText weight="duotone" /><span><strong>{applicationCount}</strong>online applications</span></article><article className="surface"><Funnel weight="duotone" /><span><strong>{leads.length}</strong>open intake leads</span></article></section>
    <section className="surface lead-inbox-table"><div className="surface-head"><h2>Recent leads</h2><small>Newest first</small></div>{leads.length ? <div className="lead-inbox-list">{leads.map(item => <article key={item.id}><div className="lead-source-mark">{item.source === "book_appointment" ? <CalendarCheck weight="duotone" /> : <ClipboardText weight="duotone" />}</div><div><header><strong>{item.company}</strong><span className="status-pill neutral">{sourceLabel(item.source)}</span></header><p>{item.problem || "No problem statement provided."}</p><div className="lead-meta-row"><span><UserCircle /> {item.contact}{item.role ? ` · ${item.role}` : ""}</span><span><EnvelopeSimple /> {item.email}</span>{item.channel && <span>{item.channel}</span>}{item.urgency && <span>{item.urgency}</span>}{item.spend && <span>{item.spend}</span>}</div></div><aside><strong>{statusLabel(item.status)}</strong><small>{new Date(item.createdAt).toLocaleDateString("en-GB")}</small>{item.preferredTime && <small>{item.preferredTime}</small>}</aside></article>)}</div> : <div className="empty-state"><Funnel weight="duotone" /><h2>No intake leads yet</h2><p>Submissions from Book appointment and Apply online will appear here after the public form is submitted.</p></div>}</section>
  </div>;
}
