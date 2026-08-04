"use client";

import { useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react";

function ReportMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="metric-box"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

export default function ReportsPage() {
  const [detail, setDetail] = useState<"metrics" | "evidence" | null>(null);

  function exportReport() {
    const rows = ["Metric,Value,Change", "Attributed revenue,Rp 86.4m,+12.8%", "Blended ROAS,3.42x,-4.1%", "Campaign spend,Rp 25.3m,72% of plan", "On-time delivery,91%,+6pp"];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "prifyn-weekly-review-2026-08-10.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <div className="app-content"><header className="app-page-head"><div><span>Decision reporting</span><h1>Weekly review</h1><p>4–10 August 2026 · Data current through 10:18 WIB.</p></div><button className="button button-outline" type="button" onClick={exportReport}><DownloadSimple /> Export report</button></header>{detail && <div className="report-explainer" role="status"><strong>{detail === "metrics" ? "How metrics are governed" : "Evidence used in this review"}</strong><span>{detail === "metrics" ? "Attributed revenue uses the agreed workspace attribution window; ROAS divides attributed revenue by campaign spend." : "Campaign ledger, creator deliverables, imported spend, and attributed orders were refreshed at 10:18 WIB."}</span><button type="button" onClick={() => setDetail(null)}>Close</button></div>}<section className="surface"><div className="surface-head"><h2>Business performance</h2><button type="button" onClick={() => setDetail("metrics")}>Metric definitions</button></div><div className="metric-grid"><ReportMetric label="Attributed revenue" value="Rp 86.4m" note="↑ 12.8% week over week" /><ReportMetric label="Blended ROAS" value="3.42×" note="↓ 4.1% week over week" /><ReportMetric label="Campaign spend" value="Rp 25.3m" note="72% of weekly plan" /><ReportMetric label="On-time delivery" value="91%" note="↑ 6 percentage points" /></div></section><div className="app-grid" style={{ marginTop: 18 }}><section className="surface"><div className="surface-head"><h2>What changed</h2><button type="button" onClick={() => setDetail("evidence")}>View evidence</button></div><div style={{ padding: 16, display: "grid", gap: 9 }}><div className="visual-card"><span>Positive signal</span><strong>Attributed revenue increased Rp 9.8m</strong><p>Ramadan Made Simple contributed 63% of the increase.</p></div><div className="visual-card"><span>Risk signal</span><strong>Paid amplification efficiency declined</strong><p>Cost rose 24% with no corresponding conversion lift.</p></div><div className="visual-card highlight"><span>Recommended focus</span><strong>Protect creator mix; reduce paid amplification 15%</strong><p>Expected to recover 0.3–0.5× ROAS within seven days.</p></div></div></section><aside className="stack"><section className="surface"><div className="surface-head"><h2>Top creators</h2></div><div className="campaign-mini-list"><div className="campaign-mini"><i /><div><strong>Nabila Putri</strong><span>Rp 18.2m attributed</span></div><b>4.6×</b></div><div className="campaign-mini"><i /><div><strong>Ardian Prakoso</strong><span>Rp 14.7m attributed</span></div><b>4.1×</b></div><div className="campaign-mini"><i className="warning" /><div><strong>Dimas Wibowo</strong><span>Delivery risk</span></div><b>2.2×</b></div></div></section></aside></div></div>;
}
