"use client";
/* eslint-disable @next/next/no-img-element */

import { Buildings, Info, UserCircle, UsersThree } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function useGoogle() {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/configured");
      if (!response.ok) throw new Error();
      const { authClient } = await import("@/lib/auth/auth-client");
      await authClient.signIn.social({ provider: "google", callbackURL: "/app" });
    } catch {
      setMessage("Google OAuth is prepared but not connected yet. Add your client ID and secret to enable it.");
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => router.push("/app?mode=preview"), 450);
  }

  return <><button className="google-button" type="button" onClick={useGoogle} disabled={loading}>{/* Native image intentionally bypasses the worker image optimizer for this tiny official asset. */}<img className="google-g" src="/google-g.svg" alt="" width="18" height="18" />Continue with Google</button><div className="or">or continue with email</div>{message && <div className="form-alert" role="status"><Info weight="fill" />{message}</div>}<form className="auth-form" onSubmit={submit}>{mode === "sign-up" && <><fieldset className="account-type"><legend>I&apos;m joining as</legend><label><input type="radio" name="accountType" value="brand" defaultChecked /><span><Buildings /><b>Brand</b><small>Manage growth and creators</small></span></label><label><input type="radio" name="accountType" value="agency" /><span><UsersThree /><b>Agency</b><small>Operate multiple brands</small></span></label><label><input type="radio" name="accountType" value="creator" /><span><UserCircle /><b>Creator</b><small>Find and deliver campaigns</small></span></label></fieldset><div className="field-row"><div className="field"><label htmlFor="firstName">First name</label><input id="firstName" name="firstName" autoComplete="given-name" required placeholder="Rakha" /></div><div className="field"><label htmlFor="lastName">Last name</label><input id="lastName" name="lastName" autoComplete="family-name" required placeholder="Antoni" /></div></div><div className="field"><label htmlFor="company">Company or creator name</label><input id="company" name="company" autoComplete="organization" required placeholder="Nusa Spice Group" /></div></>}<div className="field"><label htmlFor="email">Work email</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></div><div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" minLength={8} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} required placeholder="At least 8 characters" /></div><button className="auth-submit" type="submit" disabled={loading}>{loading ? "Preparing your workspace…" : mode === "sign-in" ? "Sign in" : "Create account"}</button></form><p className="auth-note">By continuing, you agree to PRIFYN&apos;s <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</p></>;
}
