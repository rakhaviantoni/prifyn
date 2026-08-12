"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowUp, Sparkle } from "@phosphor-icons/react";
import { useMetricSummary } from "@/components/metrics/live-metrics";

type Message = { role: "user" | "assistant"; content: string; why?: string };
const prompts = ["What can PRIFYN confidently tell from current data?", "What data is missing before ROAS decisions?", "Which source should I import next?", "What should the team do this week?"];
const DEFAULT_BRAND_CONTEXT = "Operating brand";

function contextLine(summary: ReturnType<typeof useMetricSummary>["summary"]) {
  if (!summary.hasData) return "Import reports to unlock brand-specific answers";
  const report = `${summary.importCount} imported report${summary.importCount === 1 ? "" : "s"}`;
  const channel = `${summary.sourceCount} data source${summary.sourceCount === 1 ? "" : "s"}`;
  return `Using ${report} from ${channel}`;
}

export function Copilot() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [brand, setBrand] = useState(() => typeof window === "undefined" ? DEFAULT_BRAND_CONTEXT : window.localStorage.getItem("prifyn-active-brand") ?? DEFAULT_BRAND_CONTEXT);
  const { summary, loading: metricsLoading } = useMetricSummary();

  useEffect(() => {
    const update = (event: Event) => setBrand((event as CustomEvent<string>).detail);
    window.addEventListener("prifyn-brand-change", update);
    return () => window.removeEventListener("prifyn-brand-change", update);
  }, []);

  async function ask(question: string) {
    if (!question.trim() || loading || metricsLoading) return;
    setMessages(current => [...current, { role: "user", content: question }]);
    setValue(""); setLoading(true);
    try {
      const response = await fetch("/api/ai/insights", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question, context: { brand, period: "Last 7 days", route: window.location.pathname, evidence: { hasData: summary.hasData, importCount: summary.importCount, factCount: summary.factCount, sourceCount: summary.sourceCount, totals: summary.totals, derived: summary.derived, sources: summary.bySource, subjects: summary.bySubject, creator: summary.creator, supportedNextSources: ["Meta Ads export", "TikTok Ads export", "Google Ads export", "GA4 events", "Shopee order export", "Tokopedia order export", "affiliate/coupon report", "creator proof", "UTM destination links"], missing: { revenue: !(summary.totals.revenue_idr ?? 0), clicks: !(summary.totals.clicks ?? 0), orders: !(summary.totals.orders ?? summary.totals.conversions ?? 0) } } } }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ? `${data.message} ${data.detail}` : data.message || "AI request failed");
      setMessages(current => [...current, { role: "assistant", content: data.answer, why: `${data.why} · ${data.confidence} confidence · ${data.mode === "offline" ? "Needs setup" : "Based on workspace data"}` }]);
    } catch (error) { setMessages(current => [...current, { role: "assistant", content: "I could not complete that analysis yet.", why: `${error instanceof Error ? error.message : "AI provider unavailable."} · No business record was changed.` }]); }
    finally { setLoading(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); ask(value); }

  return <section className="surface chat-surface"><div className="copilot-context"><span>Answering for</span><strong>{brand === "Operating brand" ? "Unnamed brand profile" : brand}</strong><small>{metricsLoading ? "Checking brand data…" : contextLine(summary)}</small></div>{messages.length === 0 ? <div className="chat-empty"><div><span className="spark-large"><Sparkle weight="fill" /></span><h2>Ask PRIFYN about your growth.</h2><p>Every answer is scoped to the selected brand, reporting period, available data, and your permissions. If data is missing, PRIFYN will say what to connect or import next.</p><div className="prompt-grid">{prompts.map(prompt => <button key={prompt} disabled={metricsLoading} onClick={() => ask(prompt)}>{prompt}</button>)}</div></div></div> : <div className="chat-messages">{messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>{message.role === "assistant" && <strong>PRIFYN analysis</strong>}{message.content}{message.why && <small style={{ display: "block", marginTop: 8, color: "#69736e" }}>{message.why}</small>}</div>)}{loading && <div className="chat-message assistant"><strong>PRIFYN analysis</strong>Reviewing brand data…</div>}</div>}<form className="chat-composer" onSubmit={submit}><input aria-label="Ask PRIFYN" value={value} onChange={event => setValue(event.target.value)} placeholder={metricsLoading ? "Checking brand data…" : "Ask about revenue, campaigns, creators, or next actions…"} /><button type="submit" disabled={!value.trim() || loading || metricsLoading} aria-label="Send question"><ArrowUp weight="bold" /></button></form></section>;
}
