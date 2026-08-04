"use client";

import { useMemo, useState } from "react";

type Decision = {
  id: number;
  kind: "review" | "risk";
  tone: "green" | "amber" | "red";
  symbol: string;
  label: string;
  campaign: string;
  title: string;
  detail: React.ReactNode;
  action: string;
  due: string;
  overdue?: boolean;
};

const decisions: Decision[] = [
  {
    id: 1,
    kind: "review",
    tone: "green",
    symbol: "✓",
    label: "Approval needed",
    campaign: "Ramadan Made Simple",
    title: "Approve Nabila for your final creator slot",
    detail: <><strong>87% match</strong> · Strong food storytelling and 2.8× historical ROAS.</>,
    action: "Review creator",
    due: "Due today",
  },
  {
    id: 2,
    kind: "risk",
    tone: "amber",
    symbol: "!",
    label: "Delivery at risk",
    campaign: "Weekend Family Feast",
    title: "One deliverable is 2 days overdue",
    detail: <>Dimas has not submitted the second TikTok draft. Publication is planned for Friday.</>,
    action: "Resolve blocker",
    due: "2 days overdue",
    overdue: true,
  },
  {
    id: 3,
    kind: "risk",
    tone: "red",
    symbol: "↘",
    label: "Performance change",
    campaign: "Lunch Box Launch",
    title: "ROAS declined 18% over the last 7 days",
    detail: <>Conversion held steady, but paid amplification cost rose <strong>Rp 2.4m</strong>.</>,
    action: "See diagnosis",
    due: "High confidence",
  },
];

const nav = [
  ["Today", "⌁", "3"],
  ["Campaigns", "◫", ""],
  ["Creators", "◎", ""],
  ["CRM", "◇", ""],
  ["Reports", "⌁", ""],
  ["Data", "↥", ""],
  ["Ask PRIFYN", "✦", ""],
];

export function Dashboard() {
  const [filter, setFilter] = useState<"all" | "review" | "risk">("all");
  const [notice, setNotice] = useState<string | null>(null);
  const filtered = useMemo(
    () => decisions.filter((item) => filter === "all" || item.kind === filter),
    [filter],
  );

  function acknowledge(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2800);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand"><span className="brand-mark">P</span> PRIFYN</div>
        <button className="workspace-switcher" type="button" onClick={() => acknowledge("Workspace switching will be enabled with organization setup.")}>
          <span className="workspace-avatar">NS</span>
          <span className="workspace-copy"><strong>Nusa Spice Group</strong><span>Jakarta · 4 members</span></span>
          <span aria-hidden="true">⌄</span>
        </button>

        <span className="nav-label">Workspace</span>
        <nav className="nav-list">
          {nav.slice(0, 5).map(([label, icon, badge]) => (
            <button key={label} type="button" className={`nav-item ${label === "Today" ? "active" : ""}`} onClick={() => label !== "Today" && acknowledge(`${label} is queued for the next product slice.`)}>
              <span className="nav-icon" aria-hidden="true">{icon}</span><span>{label}</span>{badge && <span className="nav-badge">{badge}</span>}
            </button>
          ))}
        </nav>
        <span className="nav-label">Intelligence</span>
        <nav className="nav-list">
          {nav.slice(5).map(([label, icon]) => (
            <button key={label} type="button" className="nav-item" onClick={() => acknowledge(`${label} is queued for the next product slice.`)}>
              <span className="nav-icon" aria-hidden="true">{icon}</span><span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <button className="nav-item" type="button" onClick={() => acknowledge("Settings will open after workspace setup is connected.")}><span className="nav-icon" aria-hidden="true">⚙</span><span>Settings</span></button>
          <div className="profile"><span className="profile-avatar">RA</span><div><strong>Rakha Antoni</strong><span>Workspace owner</span></div></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span className="mobile-brand">PRIFYN</span>
          <label className="search">
            <span className="search-symbol" aria-hidden="true">⌕</span>
            <input aria-label="Search workspace" placeholder="Search campaigns, creators, or insights" onKeyDown={(event) => event.key === "Enter" && acknowledge("Search indexing is planned for the next slice.")} />
            <span className="shortcut" aria-hidden="true">⌘ K</span>
          </label>
          <div className="top-actions">
            <button className="icon-button" type="button" aria-label="Notifications" onClick={() => acknowledge("You have 3 decisions requiring attention.")}>◌</button>
            <button className="primary-button" type="button" onClick={() => acknowledge("Campaign creation begins with an outcome-led brief.")}>＋ New campaign</button>
          </div>
        </header>

        <div className="content">
          <section className="welcome-row" aria-labelledby="welcome-title">
            <div>
              <p className="eyebrow">Your operating day</p>
              <h1 id="welcome-title">Good morning, Rakha.</h1>
              <p className="welcome-copy">Three decisions need your attention. One may affect this week&apos;s revenue.</p>
            </div>
            <div className="date-block">Growth cycle<strong>Week 32 · 4–10 August</strong></div>
          </section>

          <div className="layout-grid">
            <div>
              <section aria-labelledby="decision-title">
                <div className="section-heading">
                  <h2 id="decision-title">Decision inbox <span className="count">{filtered.length}</span></h2>
                  <div className="filters" aria-label="Filter decisions">
                    {(["all", "review", "risk"] as const).map((value) => (
                      <button key={value} type="button" className={`filter-button ${filter === value ? "active" : ""}`} aria-pressed={filter === value} onClick={() => setFilter(value)}>
                        {value === "all" ? "All" : value === "review" ? "Needs review" : "At risk"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="decision-list">
                  {filtered.map((item) => (
                    <article className="decision-card" key={item.id}>
                      <div className={`decision-icon ${item.tone}`} aria-hidden="true">{item.symbol}</div>
                      <div className="decision-content">
                        <div className="decision-meta"><span className="status-dot" aria-hidden="true" />{item.label}<span>·</span>{item.campaign}</div>
                        <h3>{item.title}</h3>
                        <p>{item.detail}</p>
                      </div>
                      <div className="decision-action">
                        <button className="ghost-button" type="button" onClick={() => acknowledge(`${item.action}: evidence view is prepared for the campaign workflow slice.`)}>{item.action} →</button>
                        <span className={`due ${item.overdue ? "overdue" : ""}`}>{item.due}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel pulse" aria-labelledby="pulse-title">
                <div className="panel-header"><h2 id="pulse-title">Performance pulse</h2><button className="text-button" type="button" onClick={() => acknowledge("Metric evidence and source freshness will open here.")}>View evidence →</button></div>
                <div className="metrics">
                  <Metric label="Attributed revenue" value="Rp 86.4m" change="↑ 12.8% vs last week" />
                  <Metric label="Campaign ROAS" value="3.42×" change="↓ 4.1% vs last week" down />
                  <Metric label="Active creators" value="18" change="↑ 3 this week" />
                  <Metric label="On-time delivery" value="91%" change="↑ 6 pts vs last week" />
                </div>
              </section>
            </div>

            <aside className="right-column" aria-label="Growth overview">
              <section className="panel" aria-labelledby="health-title">
                <div className="panel-header"><h3 id="health-title">Active campaigns</h3><button className="text-button" type="button" onClick={() => acknowledge("Campaign portfolio view is queued for the next slice.")}>View all</button></div>
                <div className="campaign-list">
                  <Campaign name="Ramadan Made Simple" meta="8 creators · Ends 16 Aug" progress="72%" />
                  <Campaign name="Weekend Family Feast" meta="5 creators · Ends 9 Aug" progress="58%" warning />
                  <Campaign name="Lunch Box Launch" meta="12 creators · Ends 28 Aug" progress="41%" />
                </div>
              </section>

              <section className="panel insight-card" aria-labelledby="ask-title">
                <div className="insight-inner">
                  <div className="spark" aria-hidden="true">✦</div>
                  <h3 id="ask-title">Ask your business,<br />not your dashboard.</h3>
                  <p>Answers use your governed metrics and always show their evidence.</p>
                  <button className="ask-button" type="button" onClick={() => acknowledge("Ask PRIFYN will start with five governed business questions.")}><span>Why did ROAS decline?</span><span aria-hidden="true">→</span></button>
                </div>
              </section>

              <section className="panel quality" aria-labelledby="quality-title">
                <div className="quality-top"><span id="quality-title">Data readiness</span><strong>86%</strong></div>
                <div className="quality-bar" aria-label="Data readiness 86 percent"><span /></div>
                <p>Ads data is fresh. Two creators need updated audience metrics.</p>
              </section>
            </aside>
          </div>
        </div>
      </main>
      {notice && <div className="toast-note" role="status">{notice}</div>}
    </div>
  );
}

function Metric({ label, value, change, down = false }: { label: string; value: string; change: string; down?: boolean }) {
  return <div className="metric"><span className="metric-label">{label} <span aria-hidden="true">ⓘ</span></span><strong className="metric-value">{value}</strong><span className={`metric-change ${down ? "down" : ""}`}>{change}</span></div>;
}

function Campaign({ name, meta, progress, warning = false }: { name: string; meta: string; progress: string; warning?: boolean }) {
  return <div className="campaign-row"><span className={`health-dot ${warning ? "amber" : ""}`} aria-label={warning ? "At risk" : "On track"} /><div className="campaign-name"><strong>{name}</strong><span>{meta}</span></div><div className="campaign-progress"><strong>{progress}</strong>complete</div></div>;
}
