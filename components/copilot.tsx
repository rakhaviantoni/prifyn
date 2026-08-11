"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowUp, Sparkle } from "@phosphor-icons/react";

type Message = { role: "user" | "assistant"; content: string; why?: string };
const prompts = ["Why did ROAS decline this week?", "Which creator performed best?", "What should I improve this month?", "Which campaign has the highest delivery risk?"];

export function Copilot() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [brand, setBrand] = useState(() => typeof window === "undefined" ? "Nusa Spice Group" : window.localStorage.getItem("prifyn-active-brand") ?? "Nusa Spice Group");

  useEffect(() => {
    const update = (event: Event) => setBrand((event as CustomEvent<string>).detail);
    window.addEventListener("prifyn-brand-change", update);
    return () => window.removeEventListener("prifyn-brand-change", update);
  }, []);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setMessages(current => [...current, { role: "user", content: question }]);
    setValue(""); setLoading(true);
    try {
      const response = await fetch("/api/ai/insights", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question, context: { brand, period: "Last 7 days", route: window.location.pathname } }) });
      if (!response.ok) throw new Error("AI request failed");
      const data = await response.json();
      setMessages(current => [...current, { role: "assistant", content: data.answer, why: `${data.why} · ${data.confidence} confidence · ${data.mode === "demo" ? "Fallback demo answer" : "Live evidence"}` }]);
    } catch { setMessages(current => [...current, { role: "assistant", content: "I could not complete that analysis. Check the AI provider configuration and try again.", why: "No business record was changed." }]); }
    finally { setLoading(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); ask(value); }

  return <section className="surface chat-surface"><div className="copilot-context"><span>Current context</span><strong>{brand}</strong><small>Last 7 days · permission-filtered</small></div>{messages.length === 0 ? <div className="chat-empty"><div><span className="spark-large"><Sparkle weight="fill" /></span><h2>Ask PRIFYN about your growth.</h2><p>Every answer is scoped to the selected brand, reporting period, available sources, and your permissions.</p><div className="prompt-grid">{prompts.map(prompt => <button key={prompt} onClick={() => ask(prompt)}>{prompt}</button>)}</div></div></div> : <div className="chat-messages">{messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>{message.role === "assistant" && <strong>PRIFYN analysis</strong>}{message.content}{message.why && <small style={{ display: "block", marginTop: 8, color: "#69736e" }}>{message.why}</small>}</div>)}{loading && <div className="chat-message assistant"><strong>PRIFYN analysis</strong>Reviewing governed evidence…</div>}</div>}<form className="chat-composer" onSubmit={submit}><input aria-label="Ask PRIFYN" value={value} onChange={event => setValue(event.target.value)} placeholder="Ask about revenue, campaigns, creators, or next actions…" /><button type="submit" disabled={!value.trim() || loading} aria-label="Send question"><ArrowUp weight="bold" /></button></form></section>;
}
