"use client";

import Link from "next/link";
import { ArrowRight, List, X } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Brand } from "./brand";
import { LanguageToggle } from "./language";

const navigation = [
  ["Features", "/features"],
  ["Pricing", "/pricing"],
  ["Growth Intelligence", "/growth"],
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="marketing-header">
      <div className="marketing-container header-inner">
        <Brand inverse />
        <nav className={`marketing-nav ${open ? "open" : ""}`} aria-label="Marketing navigation">
          {navigation.map(([label, href]) => <Link key={href} href={href} className={pathname === href ? "active" : ""} onClick={() => setOpen(false)}>{label}</Link>)}
          <div className="mobile-nav-actions">
            <LanguageToggle inverse />
            <Link href="/auth/sign-in">Sign in</Link>
            <Link className="button button-light" href="/auth/sign-up">Start free <ArrowRight weight="bold" /></Link>
          </div>
        </nav>
        <div className="header-actions">
          <LanguageToggle inverse />
          <Link href="/auth/sign-in">Sign in</Link>
          <Link className="button button-light" href="/auth/sign-up">Start free <ArrowRight weight="bold" /></Link>
        </div>
        <button className="menu-button" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <List />}</button>
      </div>
    </header>
  );
}
