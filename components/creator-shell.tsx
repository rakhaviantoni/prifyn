"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Briefcase, ChartLineUp, CurrencyCircleDollar, House, IdentificationCard, Moon, Notebook, Sparkle, Sun, UserCircle } from "@phosphor-icons/react";
import { ReactNode, useEffect, useState } from "react";
import { Brand } from "./brand";
import { LanguageToggle } from "./language";

const nav = [["Home", "/creator", House], ["My profile", "/creator/profile", UserCircle], ["Opportunities", "/creator/opportunities", Briefcase], ["Applications", "/creator/applications", Notebook], ["Campaigns", "/creator/campaigns", Sparkle], ["Payments", "/creator/payments", CurrencyCircleDollar], ["Performance", "/creator/performance", ChartLineUp]] as const;

export function CreatorShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(); const [dark, setDark] = useState(false);
  useEffect(() => { const enabled = window.localStorage.getItem("prifyn-theme") === "dark"; document.documentElement.classList.toggle("theme-dark", enabled); queueMicrotask(() => setDark(enabled)); }, []);
  const toggle = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle("theme-dark", next); window.localStorage.setItem("prifyn-theme", next ? "dark" : "light"); };
  return <div className="app-layout creator-layout"><aside className="app-sidebar creator-sidebar"><Brand href="/creator" inverse /><div className="creator-mode-badge"><IdentificationCard /><span><strong>Creator workspace</strong>Profile visible to invited brands</span></div><nav className="app-nav" aria-label="Creator navigation">{nav.map(([label, href, Icon]) => <Link key={href} href={href} className={pathname === href ? "active" : ""}><Icon weight={pathname === href ? "fill" : "regular"} /><span>{label}</span></Link>)}</nav><div className="app-user"><b>NP</b><div><strong>Nabila Putri</strong><span>Top Creator · 92% complete</span></div></div></aside><main className="app-main"><header className="app-topbar creator-topbar"><div className="app-mobile-brand"><Brand href="/creator" compact /></div><div className="creator-topbar-title"><span>Creator OS</span><strong>Good morning, Nabila</strong></div><div className="topbar-actions"><LanguageToggle /><button className="icon-button" type="button" onClick={toggle} aria-label="Toggle theme">{dark ? <Sun /> : <Moon />}</button><button className="icon-button" type="button" aria-label="Notifications"><Bell /></button></div></header>{children}</main></div>;
}
