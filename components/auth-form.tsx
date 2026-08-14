"use client";
/* eslint-disable @next/next/no-img-element */

import { Buildings, Info, UserCircle, UsersThree } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type AccountType = "brand" | "agency" | "creator";

function configuredHosts(value: string | undefined, fallback: string[]) {
  return Array.from(new Set([...(value ?? "").split(",").map(host => host.trim()).filter(Boolean), ...fallback]));
}

function isAppHost(hostname: string) {
  const configured = configuredHosts(process.env.NEXT_PUBLIC_PRIFYN_APP_HOSTNAME, ["app.prifyn.my.id", "app.prifyn.rakhaviantoni.com"]);
  return configured.includes(hostname) || hostname.startsWith("app.");
}

function isCreatorHost(hostname: string) {
  const configured = configuredHosts(process.env.NEXT_PUBLIC_PRIFYN_CREATOR_HOSTNAME, ["creator.prifyn.my.id", "creator.prifyn.rakhaviantoni.com"]);
  return configured.includes(hostname) || hostname.startsWith("creator.");
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

export function AuthForm({ mode, initialAccountType = "brand" }: { mode: "sign-in" | "sign-up"; initialAccountType?: AccountType }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>(initialAccountType);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");

  useEffect(() => {
    const invite = new URLSearchParams(window.location.search).get("invite");
    if (invite) window.localStorage.setItem("prifyn-pending-invite", invite);
  }, []);

  async function completeWorkspaceOnboarding(input: { accountType: AccountType; workspaceName: string; displayName?: string }) {
    const response = await fetch("/api/onboarding/workspace", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error("Workspace profile could not be prepared. Please try again.");
  }

  async function useGoogle() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/configured");
      const readiness = await response.json().catch(() => ({})) as { reason?: string };
      if (!response.ok) {
        if (readiness.reason === "auth") throw new Error("Sign-in is not available right now. Please try again in a few minutes.");
        if (readiness.reason === "google") throw new Error("Google sign-in is not available here yet. Use email and password for now.");
        if (readiness.reason === "database") throw new Error("PRIFYN cannot sign you in right now. Please try again in a few minutes.");
        if (readiness.reason === "migrations") throw new Error("Sign-in setup is not complete yet. Please ask the workspace admin to finish setup.");
        throw new Error("Google sign-in could not be started. Use email and password for now.");
      }
      if (mode === "sign-up") {
        if (!workspaceName.trim()) throw new Error(accountType === "creator" ? "Enter your creator display name before continuing with Google." : "Enter your company or brand name before continuing with Google.");
        window.localStorage.setItem("prifyn-pending-onboarding", JSON.stringify({
          accountType,
          workspaceName: workspaceName.trim(),
          displayName: [firstName, lastName].filter(Boolean).join(" ").trim() || workspaceName.trim(),
        }));
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
    const formFirstName = String(form.get("firstName") || "").trim();
    const formLastName = String(form.get("lastName") || "").trim();
    const formWorkspaceName = String(form.get("workspaceName") || "").trim();
    void (async () => {
      try {
        const { authClient } = await import("@/lib/auth/auth-client");
        const callbackURL = getProductionCallbackUrl(mode === "sign-up" ? accountType : undefined);
        const result = mode === "sign-in"
          ? await authClient.signIn.email({ email, password, callbackURL })
          : await authClient.signUp.email({ email, password, name: [formFirstName, formLastName].filter(Boolean).join(" ") || email, callbackURL });
        if (result.error) throw new Error(result.error.message || "Authentication failed.");
        if (mode === "sign-up") {
          const onboarding = {
            accountType,
            workspaceName: formWorkspaceName,
            displayName: [formFirstName, formLastName].filter(Boolean).join(" ") || formWorkspaceName,
          };
          try {
            await completeWorkspaceOnboarding(onboarding);
          } catch {
            window.localStorage.setItem("prifyn-pending-onboarding", JSON.stringify(onboarding));
          }
        }
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
      : { label: "Company / workspace name", placeholder: "Your company or agency", help: "The company workspace that will contain your operating brands and team." };

  return <><button className="google-button" type="button" onClick={useGoogle} disabled={loading}><img className="google-g" src="/google-g.svg" alt="" width="18" height="18" />Continue with Google</button><div className="or">or continue with email</div>{message && <div className="form-alert" role="status"><Info weight="fill" />{message}</div>}<form className="auth-form" onSubmit={submit}>{mode === "sign-up" && <><fieldset className="account-type"><legend>I&apos;m joining as</legend><label><input type="radio" name="accountType" value="brand" checked={accountType === "brand"} onChange={() => setAccountType("brand")} /><span><Buildings /><b>Brand</b><small>Manage growth and creators</small></span></label><label><input type="radio" name="accountType" value="agency" checked={accountType === "agency"} onChange={() => setAccountType("agency")} /><span><UsersThree /><b>Agency</b><small>Operate multiple brands</small></span></label><label><input type="radio" name="accountType" value="creator" checked={accountType === "creator"} onChange={() => setAccountType("creator")} /><span><UserCircle /><b>Creator</b><small>Find and deliver campaigns</small></span></label></fieldset><div className="field-row"><div className="field"><label htmlFor="firstName">First name</label><input id="firstName" name="firstName" autoComplete="given-name" required placeholder="Rakha" value={firstName} onChange={event => setFirstName(event.target.value)} /></div><div className="field"><label htmlFor="lastName">Last name</label><input id="lastName" name="lastName" autoComplete="family-name" required placeholder="Antoni" value={lastName} onChange={event => setLastName(event.target.value)} /></div></div><div className="field"><label htmlFor="workspaceName">{identityField.label}</label><input id="workspaceName" name="workspaceName" autoComplete={accountType === "creator" ? "nickname" : "organization"} required placeholder={identityField.placeholder} value={workspaceName} onChange={event => setWorkspaceName(event.target.value)} /><small className="field-help">{identityField.help}</small></div></>}<div className="field"><label htmlFor="email">{mode === "sign-up" && accountType === "creator" ? "Email" : "Work email"}</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></div><div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" minLength={8} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} required placeholder="At least 8 characters" /></div><button className="auth-submit" type="submit" disabled={loading}>{loading ? "Preparing your workspace…" : mode === "sign-in" ? "Sign in" : accountType === "creator" ? "Create creator account" : "Create workspace"}</button></form><p className="auth-note">By continuing, you agree to PRIFYN&apos;s <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</p></>;
}
