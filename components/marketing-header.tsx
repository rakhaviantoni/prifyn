"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, CaretDown, ChartLineUp, List, Newspaper, Storefront, UserCircle, UsersThree, X } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "./brand";
import { LanguageToggle } from "./language";

const menus = [
  { label: "Product", items: [
    { label: "Growth OS overview", copy: "See how campaigns, creators, and decisions connect.", href: "/growth", icon: ChartLineUp },
    { label: "Features", copy: "Explore the workflows available today.", href: "/features", icon: Briefcase },
    { label: "Pricing", copy: "Start focused and expand when ready.", href: "/pricing", icon: Storefront },
  ], featured: { eyebrow: "Growth OS", title: "From campaign signal to an owned next action.", copy: "See the complete operating model.", href: "/growth" } },
  { label: "Solutions", items: [
    { label: "For Brands", copy: "Run accountable growth with one team rhythm.", href: "/solutions/brands", icon: Storefront },
    { label: "For Agencies", copy: "Operate multiple clients without data overlap.", href: "/solutions/agencies", icon: UsersThree },
    { label: "For Creators", copy: "Find aligned work and manage delivery clearly.", href: "/solutions/creators", icon: UserCircle },
  ], featured: { eyebrow: "Choose your path", title: "One system, shaped around how you work.", copy: "Compare workflows by role.", href: "/growth" } },
  { label: "Resources", items: [
    { label: "Blog", copy: "Practical thinking for better growth operations.", href: "/blog", icon: Newspaper },
    { label: "Case Studies", copy: "See operating problems translated into decisions.", href: "/case-studies", icon: ChartLineUp },
  ], featured: { eyebrow: "Latest field note", title: "Growth without readiness is an expensive illusion.", copy: "6 min read · Growth operations", href: "/blog/growth-without-operational-readiness" } },
] as const;

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  useEffect(() => { const update = () => setScrolled(window.scrollY > 12); update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []);
  const isGroupActive = (items: typeof menus[number]["items"]) => items.some(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const closeNavigation = () => { setMobileOpen(false); setActiveMenu(null); };

  return <header className={`marketing-header ${scrolled ? "scrolled" : ""}`} onMouseLeave={() => setActiveMenu(null)}>
    <div className="marketing-container header-inner">
      <Brand inverse />
      <nav className={`marketing-nav ${mobileOpen ? "open" : ""}`} aria-label="Marketing navigation">
        {menus.map(menu => <div className={`nav-group ${activeMenu === menu.label ? "open" : ""}`} key={menu.label}>
          <button type="button" className={isGroupActive(menu.items) ? "active" : ""} aria-expanded={activeMenu === menu.label} onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)} onMouseEnter={() => setActiveMenu(menu.label)} onFocus={() => setActiveMenu(menu.label)}>{menu.label}<CaretDown /></button>
          <div className="nav-dropdown"><div className="nav-mega-links">{menu.items.map(({ label, copy, href, icon: Icon }) => <Link href={href} key={href} onClick={closeNavigation} className={pathname === href || pathname.startsWith(`${href}/`) ? "active" : ""}><span><Icon weight="duotone" /></span><div><strong>{label}</strong><small>{copy}</small></div><ArrowRight /></Link>)}</div><Link className="nav-mega-feature" href={menu.featured.href} onClick={closeNavigation}><span>{menu.featured.eyebrow}</span><strong>{menu.featured.title}</strong><small>{menu.featured.copy}</small><b>Explore <ArrowRight /></b></Link></div>
        </div>)}
        <div className="mobile-nav-actions"><LanguageToggle inverse /><Link href="/auth/sign-in" onClick={closeNavigation}>Sign in</Link><Link className="button button-light" href="/auth/sign-up" onClick={closeNavigation}>Start free <ArrowRight weight="bold" /></Link></div>
      </nav>
      <div className="header-actions"><LanguageToggle inverse /><Link href="/auth/sign-in">Sign in</Link><Link className="button button-light" href="/auth/sign-up">Start free <ArrowRight weight="bold" /></Link></div>
      <button className="menu-button" type="button" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <List />}</button>
    </div>
  </header>;
}
