import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthAudience, AuthPage } from "@/components/auth-page";
import { canonicalAuthUrl, isPortalHost } from "@/lib/portal-url";

export const metadata: Metadata = { title: "Sign in" };

function inferAudience(host: string, returnTo?: string): AuthAudience {
  if (returnTo?.startsWith("/admin")) return "admin";
  if (returnTo?.startsWith("/creator") || host.startsWith("creator.")) return "creator";
  return "app";
}

export default async function SignInPage({ searchParams }: { searchParams?: Promise<{ returnTo?: string }> }) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const params = await searchParams;
  const audience = inferAudience(host, params?.returnTo);
  if (audience === "app" && !isPortalHost(host, "app")) redirect(canonicalAuthUrl("sign-in", "app", params?.returnTo ?? "/app"));
  if (audience === "creator" && !isPortalHost(host, "creator")) redirect(canonicalAuthUrl("sign-in", "creator", params?.returnTo ?? "/creator"));
  return <AuthPage mode="sign-in" audience={audience} />;
}
