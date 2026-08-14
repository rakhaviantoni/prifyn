"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { useSyncExternalStore } from "react";

const subscribeToHost = () => () => undefined;
const serverAppHost = () => false;
const configuredHosts = (value?: string, fallback: string[] = []) => Array.from(new Set([...(value ?? "").split(",").map(host => host.trim()).filter(Boolean), ...fallback]));
const browserAppHost = () => {
  const hostname = window.location.hostname;
  const configured = configuredHosts(process.env.NEXT_PUBLIC_PRIFYN_APP_HOSTNAME, ["app.prifyn.my.id", "app.prifyn.rakhaviantoni.com"]);
  return configured.includes(hostname) || hostname.startsWith("app.");
};

export function useWorkspaceHref(href: string) {
  const pathname = usePathname();
  const isAppHost = useSyncExternalStore(subscribeToHost, browserAppHost, serverAppHost);
  const useCleanRoutes = isAppHost || !pathname.startsWith("/app");
  if (!useCleanRoutes) return href;
  const clean = href.replace(/^\/app(?=\/|$)/, "");
  return clean || "/";
}

type WorkspaceLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export function WorkspaceLink({ href, ...props }: WorkspaceLinkProps) {
  return <Link href={useWorkspaceHref(href)} {...props} />;
}
