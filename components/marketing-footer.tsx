import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Brand } from "./brand";

const groups = [
  ["Product", [["Growth OS overview", "/growth"], ["Features", "/features"], ["Pricing", "/pricing"], ["Product demo", "/demo"]]],
  ["Solutions", [["For Brands", "/solutions/brands"], ["For Agencies", "/solutions/agencies"], ["For Creators", "/solutions/creators"]]],
  ["Start", [["Book appointment", "/book"], ["Apply online", "/apply"], ["Create workspace", "/auth/sign-up"]]],
  ["Resources", [["Docs", "/docs"], ["Blog", "/blog"], ["Case Studies", "/case-studies"], ["Security", "/features#trust"], ["Contact", "mailto:hello@prifyn.com"]]],
];

export function MarketingFooter() {
  return <footer className="marketing-footer"><div className="marketing-container footer-grid"><div className="footer-brand"><Brand inverse /><p>The AI-native Growth Operating System for ambitious businesses and multi-brand teams.</p><span>Build demand. Operate with confidence.</span></div>{groups.map(([title, links]) => <div className="footer-group" key={title as string}><strong>{title as string}</strong>{(links as string[][]).map(([label, href]) => <Link href={href} key={label}>{label}{href.startsWith("http") && <ArrowUpRight />}</Link>)}</div>)}</div><div className="marketing-container footer-bottom"><span>© 2026 PRIFYN. Built deliberately.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div></footer>;
}
