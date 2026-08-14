import type { Metadata } from "next";
import { headers } from "next/headers";
import { AuthAudience, AuthPage } from "@/components/auth-page";

export const metadata: Metadata = { title: "Create workspace" };

function inferAudience(host: string, returnTo?: string): AuthAudience {
  if (returnTo?.startsWith("/creator") || host.startsWith("creator.")) return "creator";
  return "app";
}

export default async function SignUpPage({ searchParams }: { searchParams?: Promise<{ returnTo?: string }> }) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const params = await searchParams;
  return <AuthPage mode="sign-up" audience={inferAudience(host, params?.returnTo)} />;
}
