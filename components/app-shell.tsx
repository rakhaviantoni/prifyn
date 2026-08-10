"use client";

import { usePathname } from "next/navigation";
import {
  Bell, CaretDown, ChartLine, CirclesFour, GearSix, House, IdentificationBadge,
  List, MagnifyingGlass, Megaphone, Moon, Plus, Sparkle, Sun, UsersThree, X,
} from "@phosphor-icons/react";
import { ReactNode, useEffect, useState } from "react";
import { Brand } from "./brand";
import { LanguageToggle } from "./language";
import { useWorkspaceHref, WorkspaceLink } from "./workspace-link";

const mainNav = [
  ["Today", "/app", House],
  ["Ads Manager", "/app/ads-window", Megaphone],
  ["KOL Campaigns", "/app/kol-window", UsersThree],
  ["Talent Pipeline", "/app/talent-pipeline", UsersThree],
  ["Creator Discovery", "/app/creators", IdentificationBadge],
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);
  const showNotice = (value: string) => { setNotice(value); window.setTimeout(() => setNotice(null), 2600); };

  useEffect(() => {
    const enabled = window.localStorage.getItem("prifyn-theme") === "dark";
    document.documentElement.classList.toggle("theme-dark", enabled);
    queueMicrotask(() => setDark(enabled));
  }, []);
  useEffect(() => {
    if (workspaceHome !== "/" || !pathname.startsWith("/app")) return;
    const cleanPath = pathname.replace(/^\/app(?=\/|$)/, "") || "/";
    window.history.replaceState(window.history.state, "", `${cleanPath}${window.location.search}${window.location.hash}`);
  }, [pathname, workspaceHome]);
  useEffect(() => {
    document.body.classList.toggle("mobile-nav-open", mobileOpen);
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.classList.remove("mobile-nav-open"); window.removeEventListener("keydown", closeOnEscape); };
  }, [mobileOpen]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("theme-dark", next);
    window.localStorage.setItem("prifyn-theme", next ? "dark" : "light");
  };
  const workspacePath = pathname === "/" ? "/app" : pathname.startsWith("/app") ? pathname : `/app${pathname}`;
  const isActive = (href: string) => {
    if (href === "/app" || href === "/app/settings") return workspacePath === href;
    return workspacePath === href || workspacePath.startsWith(`${href}/`);
  };

  return <div className="app-layout">
    <aside id="workspace-navigation" className={`app-sidebar ${mobileOpen ? "mobile-open" : ""}`} aria-label="Workspace menu">
      <div className="app-sidebar-header"><Brand href={workspaceHome} inverse /><button className="mobile-sidebar-close" type="button" aria-label="Close workspace menu" onClick={closeMobile}><X /></button></div>
      <button className="workspace-button" type="button" onClick={() => showNotice("Switch between operating brands without mixing data or permissions.")}><b>NS</b><div><strong>Nusa Spice Group</strong><span>Jakarta · 4 members</span></div><CaretDown /></button>
      <div className="app-sidebar-scroll">
        <span className="app-nav-label">Workspace</span>
        <nav className="app-nav" aria-label="Workspace navigation">{mainNav.map(([label, href, Icon]) => <WorkspaceLink href={href} key={href} onClick={closeMobile} className={isActive(href) ? "active" : ""}><Icon weight={isActive(href) ? "fill" : "regular"} /><span>{label}</span>{label === "Today" && <b className="app-nav-badge">3</b>}</WorkspaceLink>)}</nav>
        <span className="app-nav-label">Intelligence</span>
        <nav className="app-nav" aria-label="Intelligence navigation">{intelligenceNav.map(([label, href, Icon]) => <WorkspaceLink href={href} key={href} onClick={closeMobile} className={isActive(href) ? "active" : ""}><Icon weight={isActive(href) ? "fill" : "regular"} /><span>{label}</span></WorkspaceLink>)}</nav>
      </div>
      <div className="mobile-sidebar-actions"><WorkspaceLink className="button button-light" href="/app/ads-window" onClick={closeMobile}><Plus weight="bold" /> New campaign</WorkspaceLink><div><LanguageToggle /><button className="icon-button theme-toggle" type="button" aria-label={dark ? "Use light theme" : "Use dark theme"} onClick={toggleTheme}><Sun className="theme-icon-sun" /><Moon className="theme-icon-moon" /></button><button className="icon-button" type="button" aria-label="Notifications" onClick={() => showNotice("You have three decisions requiring attention.")}><Bell /></button></div></div>
      <div className="app-user"><b>RA</b><div><strong>Rakha Antoni</strong><span>Workspace owner · Preview</span></div></div>
    </aside>
    {mobileOpen && <button className="mobile-sidebar-backdrop" type="button" aria-label="Close workspace menu" onClick={closeMobile} />}
    <main className="app-main"><header className="app-topbar"><button className="mobile-app-menu" type="button" aria-label="Open workspace menu" aria-controls="workspace-navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><List /></button><div className="app-mobile-brand"><Brand href={workspaceHome} compact /></div><label className="app-search"><MagnifyingGlass /><input aria-label="Search workspace" placeholder="Search campaigns, creators, insights" onKeyDown={event => event.key === "Enter" && showNotice("Search is ready for database indexing.")} /></label><div className="topbar-actions"><LanguageToggle /><button className="icon-button theme-toggle" type="button" aria-label={dark ? "Use light theme" : "Use dark theme"} onClick={toggleTheme}><Sun className="theme-icon-sun" /><Moon className="theme-icon-moon" /></button><button className="icon-button" type="button" aria-label="Notifications" onClick={() => showNotice("You have three decisions requiring attention.")}><Bell /></button><WorkspaceLink className="button button-dark" href="/app/ads-window"><Plus weight="bold" /> New campaign</WorkspaceLink></div></header>{children}</main>
    {notice && <div className="toast" role="status"><CirclesFour weight="fill" />{notice}</div>}
  </div>;
}
