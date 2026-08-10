const DEFAULT_LOCAL_ORIGINS = ["http://localhost:3000", "http://localhost:8888"];

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

export function getAuthTrustedOrigins() {
  const origins = [
    ...DEFAULT_LOCAL_ORIGINS,
    toOrigin(process.env.BETTER_AUTH_URL),
    toOrigin(process.env.NEXT_PUBLIC_APP_URL),
    ...splitList(process.env.BETTER_AUTH_TRUSTED_ORIGINS).map(value => toOrigin(value) ?? value.replace(/\/$/, "")),
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(origins));
}

export function getAuthAllowedHosts() {
  const hosts = [
    "localhost:3000",
    "localhost:8888",
    "127.0.0.1:3000",
    process.env.PRIFYN_APP_HOSTNAME,
    process.env.NEXT_PUBLIC_PRIFYN_APP_HOSTNAME,
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
