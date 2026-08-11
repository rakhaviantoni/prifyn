"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Briefcase, ChartLineUp, CurrencyCircleDollar, House, IdentificationCard, List, Moon, Notebook, SignOut, Sparkle, Sun, UserCircle, X } from "@phosphor-icons/react";
import { ReactNode, useEffect, useState } from "react";
import { Brand } from "./brand";
import { LanguageToggle } from "./language";

const nav = [["Home", "/creator", House], ["My profile", "/creator/profile", UserCircle], ["Opportunities", "/creator/opportunities", Briefcase], ["Applications", "/creator/applications", Notebook], ["Campaigns", "/creator/campaigns", Sparkle], ["Payments", "/creator/payments", CurrencyCircleDollar], ["Performance", "/creator/performance", ChartLineUp]] as const;

type ShellUser = { name?: string | null; email?: string | null };

function displayName(user?: ShellUser) {
  return user?.name?.trim() || user?.email?.split("@")[0] || "Creator";
}

function initialsFrom(value?: string | null) {
  const clean = (value ?? "").trim();
  if (!clean) return "C";
  const parts = clean.includes("@") ? [clean[0]] : clean.split(/\s+/).slice(0, 2);
  return parts.map(part => part[0]).join("").toUpperCase();
}

export function CreatorShell({ children, currentUser }: { children: ReactNode; currentUser?: ShellUser }) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userName = displayName(currentUser);
  const userInitials = initialsFrom(userName);
  useEffect(() => { const enabled = window.localStorage.getItem("prifyn-theme") === "dark"; document.documentElement.classList.toggle("theme-dark", enabled); queueMicrotask(() => setDark(enabled)); }, []);
  useEffect(() => {
    document.body.classList.toggle("mobile-nav-open", mobileOpen);
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.classList.remove("mobile-nav-open"); window.removeEventListener("keydown", closeOnEscape); };
  }, [mobileOpen]);
  const toggle = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle("theme-dark", next); window.localStorage.setItem("prifyn-theme", next ? "dark" : "light"); };
  const closeMobile = () => setMobileOpen(false);
  const signOut = async () => {
    const { authClient } = await import("@/lib/auth/auth-client");
    await authClient.signOut();
    window.location.assign(new URL("/auth/sign-in", window.location.origin).toString());
  };

  return <div className="app-layout creator-layout">
    <aside id="creator-navigation" className={`app-sidebar creator-sidebar ${mobileOpen ? "mobile-open" : ""}`} aria-label="Creator menu">
      <div className="app-sidebar-header"><Brand href="/creator" inverse /><button className="mobile-sidebar-close" type="button" aria-label="Close creator menu" onClick={closeMobile}><X /></button></div>
      <div className="creator-mode-badge"><IdentificationCard /><span><strong>Creator workspace</strong>Profile visible to invited brands</span></div>
      <div className="app-sidebar-scroll"><nav className="app-nav" aria-label="Creator navigation">{nav.map(([label, href, Icon]) => <Link key={href} href={href} onClick={closeMobile} className={pathname === href ? "active" : ""}><Icon weight={pathname === href ? "fill" : "regular"} /><span>{label}</span></Link>)}</nav></div>
      <div className="mobile-sidebar-actions"><Link className="button button-light" href="/creator/opportunities" onClick={closeMobile}><Briefcase /> Find opportunities</Link><div><LanguageToggle /><button className="icon-button theme-toggle" type="button" onClick={toggle} aria-label={dark ? "Use light theme" : "Use dark theme"}><Sun className="theme-icon-sun" /><Moon className="theme-icon-moon" /></button><button className="icon-button" type="button" aria-label="Notifications"><Bell /></button></div></div>
      <div className="app-user"><b>{userInitials}</b><div><strong>{userName}</strong><span>{currentUser?.email ?? "Signed in"}</span></div><button type="button" aria-label="Sign out" onClick={signOut}><SignOut /></button></div>
    </aside>
    {mobileOpen && <button className="mobile-sidebar-backdrop" type="button" aria-label="Close creator menu" onClick={closeMobile} />}
    <main className="app-main"><header className="app-topbar creator-topbar"><button className="mobile-app-menu" type="button" aria-label="Open creator menu" aria-controls="creator-navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><List /></button><div className="app-mobile-brand"><Brand href="/creator" compact /></div><div className="creator-topbar-title"><span>Creator OS</span><strong>Welcome back, {userName}</strong></div><div className="topbar-actions"><LanguageToggle /><button className="icon-button theme-toggle" type="button" onClick={toggle} aria-label={dark ? "Use light theme" : "Use dark theme"}><Sun className="theme-icon-sun" /><Moon className="theme-icon-moon" /></button><button className="icon-button" type="button" aria-label="Notifications"><Bell /></button></div></header>{children}</main>
  </div>;
}
