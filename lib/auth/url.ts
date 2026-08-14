const DEFAULT_LOCAL_ORIGINS = ["http://localhost:3000", "http://localhost:8888"];
const DEFAULT_APP_HOSTS = ["app.prifyn.my.id", "app.prifyn.rakhaviantoni.com"];
const DEFAULT_CREATOR_HOSTS = ["creator.prifyn.my.id", "creator.prifyn.rakhaviantoni.com"];

function splitList(value?: string) {
  return (value ?? "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function toOrigin(value?: string) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function toHost(value?: string | null) {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return value && !value.includes("/") ? value : null;
  }
}

function originFromHost(value?: string | null) {
  const host = toHost(value);
  if (!host) return null;
  return `https://${host}`;
}

function originsFromHosts(value?: string | null) {
  return splitList(value ?? "")
    .map(originFromHost)
    .filter((origin): origin is string => Boolean(origin));
}

function hostsFromList(value?: string | null) {
  return splitList(value ?? "")
    .map(toHost)
    .filter((host): host is string => Boolean(host));
}

export function getAuthTrustedOrigins() {
  const origins = [
    ...DEFAULT_LOCAL_ORIGINS,
    ...DEFAULT_APP_HOSTS.map(host => `https://${host}`),
    ...DEFAULT_CREATOR_HOSTS.map(host => `https://${host}`),
    toOrigin(process.env.BETTER_AUTH_URL),
    toOrigin(process.env.NEXT_PUBLIC_APP_URL),
    ...originsFromHosts(process.env.PRIFYN_APP_HOSTNAME),
    ...originsFromHosts(process.env.PRIFYN_CREATOR_HOSTNAME),
    ...originsFromHosts(process.env.NEXT_PUBLIC_PRIFYN_APP_HOSTNAME),
    ...originsFromHosts(process.env.NEXT_PUBLIC_PRIFYN_CREATOR_HOSTNAME),
    ...splitList(process.env.BETTER_AUTH_TRUSTED_ORIGINS).map(value => toOrigin(value) ?? value.replace(/\/$/, "")),
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(origins));
}

export function getAuthAllowedHosts() {
  const hosts = [
    "localhost:3000",
    "localhost:8888",
    "127.0.0.1:3000",
    ...DEFAULT_APP_HOSTS,
    ...DEFAULT_CREATOR_HOSTS,
    ...hostsFromList(process.env.PRIFYN_APP_HOSTNAME),
    ...hostsFromList(process.env.PRIFYN_CREATOR_HOSTNAME),
    ...hostsFromList(process.env.NEXT_PUBLIC_PRIFYN_APP_HOSTNAME),
    ...hostsFromList(process.env.NEXT_PUBLIC_PRIFYN_CREATOR_HOSTNAME),
    toHost(process.env.BETTER_AUTH_URL),
    toHost(process.env.NEXT_PUBLIC_APP_URL),
    ...splitList(process.env.BETTER_AUTH_TRUSTED_ORIGINS).map(toHost),
    ...splitList(process.env.BETTER_AUTH_ALLOWED_HOSTS),
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(hosts));
}

export function getAuthFallbackOrigin() {
  return toOrigin(process.env.BETTER_AUTH_URL) ?? toOrigin(process.env.NEXT_PUBLIC_APP_URL) ?? DEFAULT_LOCAL_ORIGINS[0];
}
