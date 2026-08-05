"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  CaretDown,
  ChartLine,
  CirclesFour,
  GearSix,
  House,
  IdentificationBadge,
  MagnifyingGlass,
  Megaphone,
  Moon,
  Plus,
  Sparkle,
  Sun,
  UsersThree,
} from "@phosphor-icons/react";
import { ReactNode, useEffect, useState } from "react";
import { Brand } from "./brand";
import { LanguageToggle } from "./language";
import { useWorkspaceHref, WorkspaceLink } from "./workspace-link";

const mainNav = [
  ["Today", "/app", House],
  ["Ads Manager", "/app/ads-window", Megaphone],
  ["KOL Campaigns", "/app/kol-window", UsersThree],
  ["Creator Discovery", "/app/creators", IdentificationBadge],
  ["Talent Pipeline", "/app/talent-pipeline", UsersThree],
  ["Campaigns", "/app/campaigns", CirclesFour],
  ["Reports", "/app/reports", ChartLine],
] as const;

const intelligenceNav = [
  ["Ask PRIFYN", "/app/copilot", Sparkle],
  ["Team & Access", "/app/settings/team", UsersThree],
  ["Settings", "/app/settings", GearSix],
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const workspaceHome = useWorkspaceHref("/app");
  const [notice, setNotice] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const showNotice = (value: string) => { setNotice(value); window.setTimeout(() => setNotice(null), 2600); };
  useEffect(() => {
    const enabled = window.localStorage.getItem("prifyn-theme") === "dark";
    document.documentElement.classList.toggle("theme-dark", enabled);
    queueMicrotask(() => setDark(enabled));
  }, []);
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("theme-dark", next);
    window.localStorage.setItem("prifyn-theme", next ? "dark" : "light");
  };

  // Production serves the workspace on app.* with clean paths (/reports), while
  // localhost keeps the /app prefix. Normalize both so one navigation rule works.
  const workspacePath = pathname === "/" ? "/app" : pathname.startsWith("/app") ? pathname : `/app${pathname}`;
  const isActive = (href: string) => {
    if (href === "/app" || href === "/app/settings") return workspacePath === href;
    return workspacePath === href || workspacePath.startsWith(`${href}/`);
  };
  return <div className="app-layout"><aside className="app-sidebar"><Brand href={workspaceHome} inverse /><button className="workspace-button" type="button" onClick={() => showNotice("Switch between operating brands without mixing data or permissions.")}><b>NS</b><div><strong>Nusa Spice Group</strong><span>Jakarta · 4 members</span></div><CaretDown /></button><span className="app-nav-label">Workspace</span><nav className="app-nav" aria-label="Workspace navigation">{mainNav.map(([label, href, Icon]) => <WorkspaceLink href={href} key={href} className={isActive(href) ? "active" : ""}><Icon weight={isActive(href) ? "fill" : "regular"} /><span>{label}</span>{label === "Today" && <b className="app-nav-badge">3</b>}</WorkspaceLink>)}</nav><span className="app-nav-label">Intelligence</span><nav className="app-nav" aria-label="Intelligence navigation">{intelligenceNav.map(([label, href, Icon]) => <WorkspaceLink href={href} key={href} className={isActive(href) ? "active" : ""}><Icon weight={isActive(href) ? "fill" : "regular"} /><span>{label}</span></WorkspaceLink>)}</nav><div className="app-user"><b>RA</b><div><strong>Rakha Antoni</strong><span>Workspace owner · Preview</span></div></div></aside><main className="app-main"><header className="app-topbar"><div className="app-mobile-brand"><Brand href={workspaceHome} compact /></div><label className="app-search"><MagnifyingGlass /><input aria-label="Search workspace" placeholder="Search campaigns, creators, insights" onKeyDown={event => event.key === "Enter" && showNotice("Search is ready for database indexing.")} /></label><div className="topbar-actions"><LanguageToggle /><button className="icon-button theme-toggle" type="button" aria-label={dark ? "Use light theme" : "Use dark theme"} onClick={toggleTheme}><Sun className="theme-icon-sun" /><Moon className="theme-icon-moon" /></button><button className="icon-button" type="button" aria-label="Notifications" onClick={() => showNotice("You have three decisions requiring attention.")}><Bell /></button><WorkspaceLink className="button button-dark" href="/app/ads-window"><Plus weight="bold" /> New campaign</WorkspaceLink></div></header>{children}</main>{notice && <div className="toast" role="status"><CirclesFour weight="fill" />{notice}</div>}</div>;
}
