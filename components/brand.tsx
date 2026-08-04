import Image from "next/image";
import Link from "next/link";

export function Brand({ href = "/", inverse = false, compact = false }: { href?: string; inverse?: boolean; compact?: boolean }) {
  return (
    <Link href={href} className={`brand-lockup ${inverse ? "inverse" : ""}`} aria-label="PRIFYN home">
      <span className="brand-image"><Image src="/prifyn-mark.png" alt="" width={64} height={64} priority /></span>
      {!compact && <span>PRIFYN</span>}
    </Link>
  );
}
