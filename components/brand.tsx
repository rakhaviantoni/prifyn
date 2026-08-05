/* eslint-disable @next/next/no-img-element -- Vinext's local image optimizer has no asset binding in local development. */
import Link from "next/link";

export function Brand({ href = "/", inverse = false, compact = false }: { href?: string; inverse?: boolean; compact?: boolean }) {
  return (
    <Link href={href} className={`brand-lockup ${inverse ? "inverse" : ""} ${compact ? "compact" : ""}`} aria-label="PRIFYN home">
      <span className="brand-image"><img src="/prifyn-mark-v2.png" alt="" width="32" height="32" /></span>
      <span>PRIFYN</span>
    </Link>
  );
}
