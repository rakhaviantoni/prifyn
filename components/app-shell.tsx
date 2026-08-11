"use client";

import { usePathname } from "next/navigation";
import {
  ArrowsLeftRight, Bell, Buildings, CaretDown, ChartLine, CheckCircle, CirclesFour, CreditCard, GearSix,
  House, IdentificationBadge, List, MagnifyingGlass, Megaphone, Moon, PencilSimple, PlugsConnected,
  Plus, PlusCircle, SignOut, Sparkle, Sun, Table, UsersThree, X,
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

const intelligenceNav = [
  ["Ask PRIFYN", "/app/copilot", Sparkle],
  ["Connections", "/app/settings/connections", PlugsConnected],
  ["Data Imports", "/app/settings/imports", Table],
  ["Team & Access", "/app/settings/team", UsersThree],
  ["Billing & Usage", "/app/settings/billing", CreditCard],
  ["Settings", "/app/settings", GearSix],
] as const;

type ShellUser = { name?: string | null; email?: string | null };
type OperatingBrand = { initials: string; name: string; detail: string };

function initialsFrom(value?: string | null) {
  const clean = (value ?? "").trim();
  if (!clean) return "U";
  const parts = clean.includes("@") ? [clean[0]] : clean.split(/\s+/).slice(0, 2);
  return parts.map(part => part[0]).join("").toUpperCase();
}

function displayName(user?: ShellUser) {
  return user?.name?.trim() || user?.email?.split("@")[0] || "Workspace member";
}

function defaultBrand(): OperatingBrand {
  return { initials: "BR", name: "Operating brand", detail: "Set up brand profile" };
}

const fallbackBrands: OperatingBrand[] = [
  defaultBrand(),
  { initials: "DS", name: "Dapur Saji", detail: "Food delivery brand" },
  { initials: "NS", name: "Nusa Spice", detail: "FMCG / restaurant group" },
];

export function AppShell({ children, currentUser }: { children: ReactNode; currentUser?: ShellUser }) {
  const pathname = usePathname();
  const workspaceHome = useWorkspaceHref("/app");
  const [notice, setNotice] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [kolOpen, setKolOpen] = useState(() => pathname.startsWith("/app/kol-window") || pathname.startsWith("/app/talent-pipeline") || pathname.startsWith("/app/creators"));
  const [brandOpen, setBrandOpen] = useState(false);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [brands, setBrands] = useState<OperatingBrand[]>(fallbackBrands);
  const [activeBrand, setActiveBrand] = useState<OperatingBrand>(defaultBrand());
  const userName = displayName(currentUser);
  const userInitials = initialsFrom(userName);
  const closeMobile = () => setMobileOpen(false);
  const showNotice = (value: string) => { setNotice(value); window.setTimeout(() => setNotice(null), 2600); };

  useEffect(() => {
    const enabled = window.localStorage.getItem("prifyn-theme") === "dark";
    const storedBrands = window.localStorage.getItem("prifyn-operating-brands");
    const storedBrand = window.localStorage.getItem("prifyn-active-brand");
    document.documentElement.classList.toggle("theme-dark", enabled);
    queueMicrotask(() => {
      setDark(enabled);
      let parsedBrands = fallbackBrands;
      try {
        parsedBrands = storedBrands ? JSON.parse(storedBrands) as OperatingBrand[] : fallbackBrands;
      } catch {
        parsedBrands = fallbackBrands;
      }
      if (parsedBrands.length) setBrands(parsedBrands);
      const match = parsedBrands.find(item => item.name === storedBrand);
      if (match) setActiveBrand(match);
    });
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
  const signOut = async () => {
    const { authClient } = await import("@/lib/auth/auth-client");
    await authClient.signOut();
    window.location.assign("/auth/sign-in");
  };
  const persistBrands = (next: OperatingBrand[]) => {
    setBrands(next);
    window.localStorage.setItem("prifyn-operating-brands", JSON.stringify(next));
  };
  const selectBrand = (brand: OperatingBrand) => {
    setActiveBrand(brand);
    setBrandOpen(false);
    window.localStorage.setItem("prifyn-active-brand", brand.name);
    showNotice(`${brand.name} is now the active brand.`);
  };
  const saveBrand = (form: FormData) => {
    const previous = String(form.get("previous") ?? "");
    const name = String(form.get("name") ?? "").trim();
    const detail = String(form.get("detail") ?? "").trim() || "Operating brand";
    if (!name) return;
    const nextBrand = { initials: initialsFrom(name), name, detail };
    const next = previous
      ? brands.map(item => item.name === previous ? nextBrand : item)
      : [...brands, nextBrand];
    persistBrands(next);
    setActiveBrand(nextBrand);
    window.localStorage.setItem("prifyn-active-brand", nextBrand.name);
    setBrandDialogOpen(false);
    setBrandOpen(false);
    showNotice(`${name} saved as operating brand.`);
  };
  const workspacePath = pathname === "/" ? "/app" : pathname.startsWith("/app") ? pathname : `/app${pathname}`;
  const isActive = (href: string) => {
    if (href === "/app" || href === "/app/settings") return workspacePath === href;
    return workspacePath === href || workspacePath.startsWith(`${href}/`);
  };

  return <div className="app-layout">
    <aside id="workspace-navigation" className={`app-sidebar ${mobileOpen ? "mobile-open" : ""}`} aria-label="Workspace menu">
      <div className="app-sidebar-header"><Brand href={workspaceHome} inverse /><button className="mobile-sidebar-close" type="button" aria-label="Close workspace menu" onClick={closeMobile}><X /></button></div>
      <div className="workspace-switcher"><button className="workspace-button" type="button" aria-expanded={brandOpen} onClick={() => setBrandOpen(value => !value)}><b>{activeBrand.initials}</b><div><strong>{activeBrand.name}</strong><span>{activeBrand.detail}</span></div><CaretDown className={brandOpen ? "rotated" : ""} /></button>{brandOpen && <div className="workspace-menu" role="menu" aria-label="Brand menu">{brands.map(brand => <button type="button" role="menuitem" key={brand.name} className={brand.name === activeBrand.name ? "active" : ""} onClick={() => selectBrand(brand)}><b>{brand.initials}</b><span><strong>{brand.name}</strong><small>{brand.detail}</small></span>{brand.name === activeBrand.name ? <CheckCircle weight="fill" /> : <Buildings />}</button>)}<button type="button" role="menuitem" onClick={() => { setBrandDialogOpen(true); setBrandOpen(false); }}><b><PlusCircle weight="fill" /></b><span><strong>Add or edit brands</strong><small>Manage operating brand slots</small></span><PencilSimple /></button><WorkspaceLink href="/app/settings/team" role="menuitem" onClick={() => setBrandOpen(false)}><b><UsersThree weight="fill" /></b><span><strong>Team access</strong><small>Invite members and assign roles</small></span><GearSix /></WorkspaceLink></div>}</div>
      <div className="app-sidebar-scroll">
        <span className="app-nav-label">Workspace</span>
        <nav className="app-nav" aria-label="Workspace navigation">{mainNav.slice(0, 2).map(([label, href, Icon]) => <WorkspaceLink href={href} key={href} onClick={closeMobile} className={isActive(href) ? "active" : ""}><Icon weight={isActive(href) ? "fill" : "regular"} /><span>{label}</span>{label === "Today" && <b className="app-nav-badge">Setup</b>}</WorkspaceLink>)}<div className={`app-nav-group ${kolOpen ? "open" : ""}`}><div><WorkspaceLink href="/app/kol-window" onClick={closeMobile} className={kolNav.some(([, href]) => isActive(href)) ? "active" : ""}><UsersThree weight={kolNav.some(([, href]) => isActive(href)) ? "fill" : "regular"} /><span>KOL Campaigns</span></WorkspaceLink><button type="button" aria-label="Toggle KOL Campaigns menu" aria-expanded={kolOpen} onClick={() => setKolOpen(value => !value)}><CaretDown /></button></div><div className="app-subnav">{kolNav.map(([label, href, Icon]) => <WorkspaceLink href={href} key={href} onClick={closeMobile} className={isActive(href) ? "active" : ""}><Icon weight={isActive(href) ? "fill" : "regular"} /><span>{label}</span>{label === "Creator Discovery" && <small>Beta</small>}</WorkspaceLink>)}</div></div>{mainNav.slice(2).map(([label, href, Icon]) => <WorkspaceLink href={href} key={href} onClick={closeMobile} className={isActive(href) ? "active" : ""}><Icon weight={isActive(href) ? "fill" : "regular"} /><span>{label}</span></WorkspaceLink>)}</nav>
        <span className="app-nav-label">Intelligence</span>
        <nav className="app-nav" aria-label="Intelligence navigation">{intelligenceNav.map(([label, href, Icon]) => <WorkspaceLink href={href} key={href} onClick={closeMobile} className={isActive(href) ? "active" : ""}><Icon weight={isActive(href) ? "fill" : "regular"} /><span>{label}</span></WorkspaceLink>)}</nav>
      </div>
      <div className="mobile-sidebar-actions"><WorkspaceLink className="button button-light" href="/app/ads-window" onClick={closeMobile}><Plus weight="bold" /> New campaign</WorkspaceLink><div><LanguageToggle /><button className="icon-button theme-toggle" type="button" aria-label={dark ? "Use light theme" : "Use dark theme"} onClick={toggleTheme}><Sun className="theme-icon-sun" /><Moon className="theme-icon-moon" /></button><button className="icon-button" type="button" aria-label="Notifications" onClick={() => showNotice("You have three decisions requiring attention.")}><Bell /></button></div></div>
      <div className="app-user"><b>{userInitials}</b><div><strong>{userName}</strong><span>{currentUser?.email ?? "Signed in"}</span></div><WorkspaceLink href="/creator" aria-label="Switch to creator portal" title="Switch to creator portal without signing out"><ArrowsLeftRight /></WorkspaceLink><button type="button" aria-label="Sign out from all PRIFYN portals" title="Sign out from all PRIFYN portals" onClick={signOut}><SignOut /></button></div>
    </aside>
    {mobileOpen && <button className="mobile-sidebar-backdrop" type="button" aria-label="Close workspace menu" onClick={closeMobile} />}
    <main className="app-main"><header className="app-topbar"><button className="mobile-app-menu" type="button" aria-label="Open workspace menu" aria-controls="workspace-navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><List /></button><div className="app-mobile-brand"><Brand href={workspaceHome} compact /></div><label className="app-search"><MagnifyingGlass /><input aria-label="Search workspace" placeholder="Search campaigns, creators, insights" onKeyDown={event => event.key === "Enter" && showNotice("Search is ready for database indexing.")} /></label><div className="topbar-actions"><LanguageToggle /><button className="icon-button theme-toggle" type="button" aria-label={dark ? "Use light theme" : "Use dark theme"} onClick={toggleTheme}><Sun className="theme-icon-sun" /><Moon className="theme-icon-moon" /></button><button className="icon-button" type="button" aria-label="Notifications" onClick={() => showNotice("You have three decisions requiring attention.")}><Bell /></button><WorkspaceLink className="button button-dark" href="/app/ads-window"><Plus weight="bold" /> New campaign</WorkspaceLink></div></header>{children}</main>
    {brandDialogOpen && <div className="dialog-backdrop" onMouseDown={() => setBrandDialogOpen(false)}><section className="dialog-card brand-dialog" role="dialog" aria-modal="true" aria-labelledby="brand-dialog-title" onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Close" onClick={() => setBrandDialogOpen(false)}><X /></button><span className="section-kicker">Operating brands</span><h2 id="brand-dialog-title">Add or edit brands</h2><p>Use brand slots for real operating brands, client accounts, or business units. The active brand controls which campaigns, imports, reports, and team scopes you review.</p><div className="brand-dialog-list">{brands.map(brand => <article key={brand.name} className={brand.name === activeBrand.name ? "active" : ""}><span><Buildings weight="duotone" /></span><div><strong>{brand.name}</strong><small>{brand.detail}</small></div><button type="button" onClick={() => selectBrand(brand)}>{brand.name === activeBrand.name ? "Active" : "Use"}</button></article>)}</div><form className="dialog-form" action={saveBrand}><input type="hidden" name="previous" value={activeBrand.name === "Operating brand" ? "" : activeBrand.name} /><label className="field"><span>Brand name</span><input name="name" required defaultValue={activeBrand.name === "Operating brand" ? "" : activeBrand.name} placeholder="e.g. Nusa Spice" /></label><label className="field"><span>Brand detail</span><input name="detail" defaultValue={activeBrand.name === "Operating brand" ? "" : activeBrand.detail} placeholder="e.g. FMCG / Jakarta / Growth plan" /></label><div className="dialog-actions"><button className="button button-outline" type="button" onClick={() => setBrandDialogOpen(false)}>Cancel</button><button className="button button-dark" type="submit"><CheckCircle weight="fill" /> Save brand</button></div></form></section></div>}
    {notice && <div className="toast" role="status"><CirclesFour weight="fill" />{notice}</div>}
  </div>;
}
