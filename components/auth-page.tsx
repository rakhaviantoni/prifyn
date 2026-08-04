import Link from "next/link";
import { AuthForm } from "./auth-form";
import { Brand } from "./brand";

export function AuthPage({ mode }: { mode: "sign-in" | "sign-up" }) {
  const signUp = mode === "sign-up";
  return <main className="auth-page"><section className="auth-brand-panel"><Brand inverse /><div className="auth-quote"><blockquote>{signUp ? "Build demand. Operate with confidence." : "The next decision should never be buried in a dashboard."}</blockquote><p>Plan campaigns, coordinate creators, connect performance, and act on evidence from one calm operating system.</p></div><span className="auth-foot">PRIFYN Growth OS · Private product preview</span></section><section className="auth-form-panel"><div className="auth-form-wrap"><div className="auth-mobile-brand"><Brand /></div><h1>{signUp ? "Create your workspace" : "Welcome back"}</h1><p>{signUp ? <>Already operating with PRIFYN? <Link href="/auth/sign-in">Sign in</Link></> : <>New to PRIFYN? <Link href="/auth/sign-up">Create an account</Link></>}</p><AuthForm mode={mode} /></div></section></main>;
}
