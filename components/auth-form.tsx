"use client";
/* eslint-disable @next/next/no-img-element */

import { Buildings, Info, UserCircle, UsersThree } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AccountType = "brand" | "agency" | "creator";

function isAppHost(hostname: string) {
  const configured = process.env.NEXT_PUBLIC_PRIFYN_APP_HOSTNAME;
  return hostname === configured || hostname.startsWith("app.");
}

function isCreatorHost(hostname: string) {
  const configured = process.env.NEXT_PUBLIC_PRIFYN_CREATOR_HOSTNAME;
  return hostname === configured || hostname.startsWith("creator.");
}

function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/auth")) return null;
  return value;
}

function subdomainPath(pathname: string, hostType: "app" | "creator") {
  if (hostType === "app" && pathname.startsWith("/app")) return pathname.replace(/^\/app/, "") || "/";
  if (hostType === "creator" && pathname.startsWith("/creator")) return pathname.replace(/^\/creator/, "") || "/";
  return pathname;
}

function getProductionCallbackUrl(accountType?: AccountType) {
  if (typeof window === "undefined") return "/app";
  const requestedReturnTo = safeReturnTo(new URLSearchParams(window.location.search).get("returnTo"));
  const hostname = window.location.hostname;
  const defaultPath = accountType === "creator" ? "/creator" : isCreatorHost(hostname) ? "/" : "/app";
  const url = new URL(requestedReturnTo ?? defaultPath, window.location.origin);
  if (isAppHost(hostname)) url.pathname = subdomainPath(url.pathname, "app");
  if (isCreatorHost(hostname)) url.pathname = subdomainPath(url.pathname, "creator");
  return url.toString();
}

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("brand");

  async function useGoogle() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/configured");
      const readiness = await response.json().catch(() => ({})) as { reason?: string };
      if (!response.ok) {
        if (readiness.reason === "database") throw new Error("PRIFYN cannot reach the authentication database. Check DATABASE_URL in the deployed environment.");
        if (readiness.reason === "migrations") throw new Error("The authentication schema is not installed yet. Run the checked-in database migrations once, then try again.");
        throw new Error("Google sign-in credentials are not configured for this domain yet.");
      }
      const oauth = await fetch("/api/auth/sign-in/social", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          provider: "google",
          callbackURL: getProductionCallbackUrl(mode === "sign-up" ? accountType : undefined),
          disableRedirect: true,
        }),
      });
      const result = await oauth.json().catch(() => ({})) as { url?: string; error?: { message?: string }; message?: string };
      if (!oauth.ok || !result.url) throw new Error(result.error?.message || result.message || "Google sign-in could not be started.");
      window.location.assign(result.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Google sign-in could not be started. Please try again.");
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const firstName = String(form.get("firstName") || "").trim();
    const lastName = String(form.get("lastName") || "").trim();
    void (async () => {
      try {
        const { authClient } = await import("@/lib/auth/auth-client");
        const callbackURL = getProductionCallbackUrl(mode === "sign-up" ? accountType : undefined);
        const result = mode === "sign-in"
          ? await authClient.signIn.email({ email, password, callbackURL })
          : await authClient.signUp.email({ email, password, name: [firstName, lastName].filter(Boolean).join(" ") || email, callbackURL });
        if (result.error) throw new Error(result.error.message || "Authentication failed.");
        router.push(new URL(callbackURL).pathname);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Authentication failed. Please try again.");
        setLoading(false);
      }
    })();
  }

  const identityField = accountType === "creator"
    ? { label: "Creator display name", placeholder: "Rani Creates", help: "Your public creator or channel name. Your personal first and last name above remain separate." }
    : accountType === "agency"
      ? { label: "Agency / workspace name", placeholder: "Northstar Creative", help: "The workspace your team and client brands will belong to." }
      : { label: "Company / workspace name", placeholder: "Nusa Spice Group", help: "The company workspace that will contain your operating brands and team." };

  return <><button className="google-button" type="button" onClick={useGoogle} disabled={loading}><img className="google-g" src="/google-g.svg" alt="" width="18" height="18" />Continue with Google</button><div className="or">or continue with email</div>{message && <div className="form-alert" role="status"><Info weight="fill" />{message}</div>}<form className="auth-form" onSubmit={submit}>{mode === "sign-up" && <><fieldset className="account-type"><legend>I&apos;m joining as</legend><label><input type="radio" name="accountType" value="brand" checked={accountType === "brand"} onChange={() => setAccountType("brand")} /><span><Buildings /><b>Brand</b><small>Manage growth and creators</small></span></label><label><input type="radio" name="accountType" value="agency" checked={accountType === "agency"} onChange={() => setAccountType("agency")} /><span><UsersThree /><b>Agency</b><small>Operate multiple brands</small></span></label><label><input type="radio" name="accountType" value="creator" checked={accountType === "creator"} onChange={() => setAccountType("creator")} /><span><UserCircle /><b>Creator</b><small>Find and deliver campaigns</small></span></label></fieldset><div className="field-row"><div className="field"><label htmlFor="firstName">First name</label><input id="firstName" name="firstName" autoComplete="given-name" required placeholder="Rakha" /></div><div className="field"><label htmlFor="lastName">Last name</label><input id="lastName" name="lastName" autoComplete="family-name" required placeholder="Antoni" /></div></div><div className="field"><label htmlFor="workspaceName">{identityField.label}</label><input id="workspaceName" name="workspaceName" autoComplete={accountType === "creator" ? "nickname" : "organization"} required placeholder={identityField.placeholder} /><small className="field-help">{identityField.help}</small></div></>}<div className="field"><label htmlFor="email">{mode === "sign-up" && accountType === "creator" ? "Email" : "Work email"}</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></div><div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" minLength={8} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} required placeholder="At least 8 characters" /></div><button className="auth-submit" type="submit" disabled={loading}>{loading ? "Preparing your workspace…" : mode === "sign-in" ? "Sign in" : accountType === "creator" ? "Create creator account" : "Create workspace"}</button></form><p className="auth-note">By continuing, you agree to PRIFYN&apos;s <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</p></>;
}
