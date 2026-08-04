import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Brand } from "./brand";

const groups = [
  ["Product", [["Features", "/features"], ["Pricing", "/pricing"], ["For Ads", "/ads"], ["Growth OS", "/app"]]],
  ["Company", [["Vision", "/#vision"], ["Security", "/features#trust"], ["Contact", "mailto:hello@prifyn.com"]]],
  ["Access", [["Sign in", "/auth/sign-in"], ["Create account", "/auth/sign-up"], ["Product preview", "/app"]]],
];

export function MarketingFooter() {
  return <footer className="marketing-footer"><div className="marketing-container footer-grid"><div className="footer-brand"><Brand inverse /><p>The AI-native Growth Operating System for SMEs.</p><span>Build demand. Operate with confidence.</span></div>{groups.map(([title, links]) => <div className="footer-group" key={title as string}><strong>{title as string}</strong>{(links as string[][]).map(([label, href]) => <Link href={href} key={label}>{label}{href.startsWith("http") && <ArrowUpRight />}</Link>)}</div>)}</div><div className="marketing-container footer-bottom"><span>© 2026 PRIFYN. Built deliberately.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div></footer>;
}
