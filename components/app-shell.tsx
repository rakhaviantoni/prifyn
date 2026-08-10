"use client";

import { usePathname } from "next/navigation";
import {
  Bell, CaretDown, ChartLine, CheckCircle, CirclesFour, GearSix, House, IdentificationBadge,
  List, MagnifyingGlass, Megaphone, Moon, Plus, Sparkle, Sun, UsersThree, X,
} from "@phosphor-icons/react";
import { ReactNode, useEffect, useState } from "react";
import { Brand } from "./brand";
import { LanguageToggle } from "./language";
import { useWorkspaceHref, WorkspaceLink } from "./workspace-link";

const mainNav = [
  ["Today", "/app", House],
  ["Ads Manager", "/app/ads-window", Megaphone],
  ["Campaigns", "/app/campaigns", CirclesFour],
  ["Reports", "/app/reports", ChartLine],
] as const;

const kolNav = [
  ["Launch Campaign", "/app/kol-window", Megaphone],
  ["Talent Pipeline", "/app/talent-pipeline", UsersThree],
  ["Creator Discovery", "/app/creators", IdentificationBadge],
] as const;

const brands = [
  { initials: "NS", name: "Nusa Spice Group", detail: "Primary brand · Jakarta" },
  { initials: "DS", name: "Dapur Saji", detail: "Consumer brand · Jakarta" },
  { initials: "KO", name: "Kawan Office", detail: "B2B brand · Surabaya" },
];

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
  const [kolOpen, setKolOpen] = useState(() => pathname.startsWith("/app/kol-window") || pathname.startsWith("/app/talent-pipeline") || pathname.startsWith("/app/creators"));
  const [brandOpen, setBrandOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState(brands[0]);
  const closeMobile = () => setMobileOpen(false);
  const showNotice = (value: string) => { setNotice(value); window.setTimeout(() => setNotice(null), 2600); };

  useEffect(() => {
    const enabled = window.localStorage.getItem("prifyn-theme") === "dark";
    const storedBrand = window.localStorage.getItem("prifyn-active-brand");
    const matchingBrand = brands.find(brand => brand.name === storedBrand);
    document.documentElement.classList.toggle("theme-dark", enabled);
    queueMicrotask(() => { setDark(enabled); if (matchingBrand) setActiveBrand(matchingBrand); });
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
      <div className="workspace-switcher"><button className="workspace-button" type="button" aria-expanded={brandOpen} onClick={() => setBrandOpen(value => !value)}><b>{activeBrand.initials}</b><div><strong>{activeBrand.name}</strong><span>{activeBrand.detail}</span></div><CaretDown className={brandOpen ? "rotated" : ""} /></button>{brandOpen && <div className="workspace-menu" role="menu" aria-label="Switch brand">{brands.map(brand => <button type="button" role="menuitem" className={brand.name === activeBrand.name ? "active" : ""} key={brand.name} onClick={() => { setActiveBrand(brand); window.localStorage.setItem("prifyn-active-brand", brand.name); window.dispatchEvent(new CustomEvent("prifyn-brand-change", { detail: brand.name })); setBrandOpen(false); showNotice(`Switched to ${brand.name}. Campaigns, evidence, and permissions now use this brand context.`); }}><b>{brand.initials}</b><span><strong>{brand.name}</strong><small>{brand.detail}</small></span>{brand.name === activeBrand.name && <CheckCircle weight="fill" />}</button>)}</div>}</div>
      <div className="app-sidebar-scroll">
        <span className="app-nav-label">Workspace</span>
        <nav className="app-nav" aria-label="Workspace navigation">{mainNav.slice(0, 2).map(([label, href, Icon]) => <WorkspaceLink href={href} key={href} onClick={closeMobile} className={isActive(href) ? "active" : ""}><Icon weight={isActive(href) ? "fill" : "regular"} /><span>{label}</span>{label === "Today" && <b className="app-nav-badge">3</b>}</WorkspaceLink>)}<div className={`app-nav-group ${kolOpen ? "open" : ""}`}><div><WorkspaceLink href="/app/kol-window" onClick={closeMobile} className={kolNav.some(([, href]) => isActive(href)) ? "active" : ""}><UsersThree weight={kolNav.some(([, href]) => isActive(href)) ? "fill" : "regular"} /><span>KOL Campaigns</span></WorkspaceLink><button type="button" aria-label="Toggle KOL Campaigns menu" aria-expanded={kolOpen} onClick={() => setKolOpen(value => !value)}><CaretDown /></button></div><div className="app-subnav">{kolNav.map(([label, href, Icon]) => <WorkspaceLink href={href} key={href} onClick={closeMobile} className={isActive(href) ? "active" : ""}><Icon weight={isActive(href) ? "fill" : "regular"} /><span>{label}</span>{label === "Creator Discovery" && <small>Beta</small>}</WorkspaceLink>)}</div></div>{mainNav.slice(2).map(([label, href, Icon]) => <WorkspaceLink href={href} key={href} onClick={closeMobile} className={isActive(href) ? "active" : ""}><Icon weight={isActive(href) ? "fill" : "regular"} /><span>{label}</span></WorkspaceLink>)}</nav>
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
