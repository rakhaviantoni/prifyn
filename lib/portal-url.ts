const DEFAULT_APP_HOST = "app.prifyn.my.id";
const DEFAULT_CREATOR_HOST = "creator.prifyn.my.id";

function firstConfiguredHost(value: string | undefined, fallback: string) {
  return value?.split(",").map(host => host.trim()).find(Boolean) ?? fallback;
}

function stripPortalPrefix(path: string, portal: "app" | "creator") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (portal === "app" && clean.startsWith("/app")) return clean.replace(/^\/app/, "") || "/";
  if (portal === "creator" && clean.startsWith("/creator")) return clean.replace(/^\/creator/, "") || "/";
  return clean;
}

export function portalOrigin(portal: "app" | "creator") {
  const host = portal === "creator"
    ? firstConfiguredHost(process.env.NEXT_PUBLIC_PRIFYN_CREATOR_HOSTNAME, DEFAULT_CREATOR_HOST)
    : firstConfiguredHost(process.env.NEXT_PUBLIC_PRIFYN_APP_HOSTNAME, DEFAULT_APP_HOST);
  return `https://${host}`;
}

export function portalUrl(portal: "app" | "creator", path = "/") {
  return new URL(stripPortalPrefix(path, portal), portalOrigin(portal)).toString();
}

export function isPortalHost(host: string, portal: "app" | "creator") {
  const hostname = host.split(":")[0] ?? host;
  const configured = portal === "creator"
    ? [DEFAULT_CREATOR_HOST, ...(process.env.NEXT_PUBLIC_PRIFYN_CREATOR_HOSTNAME ?? "").split(",")]
    : [DEFAULT_APP_HOST, ...(process.env.NEXT_PUBLIC_PRIFYN_APP_HOSTNAME ?? "").split(",")];
  return configured.map(item => item.trim()).filter(Boolean).includes(hostname) || hostname.startsWith(`${portal}.`);
}

export function canonicalAuthUrl(mode: "sign-in" | "sign-up", portal: "app" | "creator", returnTo?: string) {
  const authPath = mode === "sign-up" ? "/auth/sign-up" : "/auth/sign-in";
  const target = new URL(authPath, portalOrigin(portal));
  if (returnTo) target.searchParams.set("returnTo", stripPortalPrefix(returnTo, portal));
  return target.toString();
}
