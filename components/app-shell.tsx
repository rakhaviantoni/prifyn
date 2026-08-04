"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CaretDown,
  ChartLine,
  CirclesFour,
  GearSix,
  House,
  MagnifyingGlass,
  Megaphone,
  Plus,
  Sparkle,
  UsersThree,
} from "@phosphor-icons/react";
import { ReactNode, useState } from "react";
import { Brand } from "./brand";

const mainNav = [
  ["Today", "/app", House],
  ["Campaigns", "/app/campaigns", Megaphone],
  ["Creators", "/app/creators", UsersThree],
  ["Reports", "/app/reports", ChartLine],
] as const;

const intelligenceNav = [
  ["Ask PRIFYN", "/app/copilot", Sparkle],
  ["Settings", "/app/settings", GearSix],
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [notice, setNotice] = useState<string | null>(null);
  const showNotice = (value: string) => { setNotice(value); window.setTimeout(() => setNotice(null), 2600); };

  return <div className="app-layout"><aside className="app-sidebar"><Brand href="/app" inverse /><button className="workspace-button" type="button" onClick={() => showNotice("Organization switching is ready for workspace data.")}><b>NS</b><div><strong>Nusa Spice Group</strong><span>Jakarta · 4 members</span></div><CaretDown /></button><span className="app-nav-label">Workspace</span><nav className="app-nav" aria-label="Workspace navigation">{mainNav.map(([label, href, Icon]) => <Link href={href} key={href} className={pathname === href ? "active" : ""}><Icon weight={pathname === href ? "fill" : "regular"} /><span>{label}</span>{label === "Today" && <b className="app-nav-badge">3</b>}</Link>)}</nav><span className="app-nav-label">Intelligence</span><nav className="app-nav" aria-label="Intelligence navigation">{intelligenceNav.map(([label, href, Icon]) => <Link href={href} key={href} className={pathname === href ? "active" : ""}><Icon weight={pathname === href ? "fill" : "regular"} /><span>{label}</span></Link>)}</nav><div className="app-user"><b>RA</b><div><strong>Rakha Antoni</strong><span>Workspace owner · Preview</span></div></div></aside><main className="app-main"><header className="app-topbar"><div className="app-mobile-brand"><Brand href="/app" compact /></div><label className="app-search"><MagnifyingGlass /><input aria-label="Search workspace" placeholder="Search campaigns, creators, insights" onKeyDown={event => event.key === "Enter" && showNotice("Search is ready for database indexing.")} /></label><div className="topbar-actions"><button className="icon-button" type="button" aria-label="Notifications" onClick={() => showNotice("You have three decisions requiring attention.")}><Bell /></button><Link className="button button-dark" href="/app/campaigns?new=true"><Plus weight="bold" /> New campaign</Link></div></header>{children}</main>{notice && <div className="toast" role="status"><CirclesFour weight="fill" />{notice}</div>}</div>;
}
