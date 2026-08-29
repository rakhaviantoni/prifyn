import Link from "next/link";
import { AuthForm } from "./auth-form";
import { Brand } from "./brand";
import { LanguageToggle } from "./language";
import { canonicalAuthUrl } from "@/lib/portal-url";

export type AuthAudience = "app" | "creator" | "admin";

const authCopy = {
  app: {
    quote: "Growth work should always lead to the next decision.",
    body: "Review campaigns, creators, imports, leads, reports, and recommendations from one operating workspace.",
    foot: "PRIFYN Growth OS · Secure workspace access",
    signInTitle: "Sign in to PRIFYN",
    signInSubtitle: "Continue to your brand workspace.",
    signUpTitle: "Create your workspace",
    signUpSubtitle: "Set up your company workspace and start from one real campaign.",
  },
  creator: {
    quote: "Your best work deserves campaigns that actually fit.",
    body: "Manage your profile, applications, submissions, approvals, payment status, and performance evidence in one creator workspace.",
    foot: "PRIFYN Creator OS · Secure creator access",
    signInTitle: "Sign in as creator",
    signInSubtitle: "Continue to your creator dashboard.",
    signUpTitle: "Create creator account",
    signUpSubtitle: "Build a profile brands can trust and apply to matched campaigns.",
  },
  admin: {
    quote: "Operate PRIFYN with the same clarity we promise customers.",
    body: "Review leads, users, workspaces, imports, reports, and onboarding activity from the internal business manager.",
    foot: "PRIFYN Business Manager · Authorized access only",
    signInTitle: "PRIFYN admin sign in",
    signInSubtitle: "Continue to the internal business manager.",
    signUpTitle: "Create your workspace",
    signUpSubtitle: "Admin access is granted by PRIFYN. Create a customer workspace only if you are onboarding a brand.",
  },
} satisfies Record<AuthAudience, {
  quote: string;
  body: string;
  foot: string;
  signInTitle: string;
  signInSubtitle: string;
  signUpTitle: string;
  signUpSubtitle: string;
}>;

export function AuthPage({ mode, audience = "app" }: { mode: "sign-in" | "sign-up"; audience?: AuthAudience }) {
  const signUp = mode === "sign-up";
  const copy = authCopy[audience];
  const initialAccountType = audience === "creator" ? "creator" : "brand";
  const signInHref = audience === "admin" ? "/auth/sign-in?returnTo=/admin" : canonicalAuthUrl("sign-in", audience, audience === "creator" ? "/creator" : "/app");
  const signUpHref = audience === "creator" ? canonicalAuthUrl("sign-up", "creator", "/creator") : canonicalAuthUrl("sign-up", "app", "/app");
  return <main className={`auth-page auth-page-${audience}`}><section className="auth-brand-panel"><Brand inverse /><div className="auth-quote"><blockquote>{copy.quote}</blockquote><p>{copy.body}</p></div><span className="auth-foot">{copy.foot}</span></section><section className="auth-form-panel"><div className="auth-language"><LanguageToggle /></div><div className="auth-form-wrap"><div className="auth-mobile-brand"><Brand /></div><span className="auth-context-pill">{audience === "admin" ? "Admin" : audience === "creator" ? "Creator" : "Workspace"}</span><h1>{signUp ? copy.signUpTitle : copy.signInTitle}</h1><p>{signUp ? <>Already operating with PRIFYN? <Link href={signInHref}>Sign in</Link></> : audience === "admin" ? <>Need access? Ask a PRIFYN owner to approve your account.</> : <>New to PRIFYN? <Link href={signUpHref}>Create an account</Link></>}</p><p className="auth-context-note">{signUp ? copy.signUpSubtitle : copy.signInSubtitle}</p><AuthForm mode={mode} initialAccountType={initialAccountType} /></div></section></main>;
}
