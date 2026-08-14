import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminBusinessManager } from "@/components/admin-business-manager";
import { getAdminSession } from "@/lib/admin/access";
import { getAdminOverview } from "@/lib/admin/overview";

export const metadata = { title: "PRIFYN Business Manager" };

export default async function AdminPage() {
  const requestHeaders = await headers();
  const admin = await getAdminSession(requestHeaders);
  if (!admin) {
    const cookie = requestHeaders.get("cookie") ?? "";
    if (!cookie.includes("better-auth")) redirect("/auth/sign-in?returnTo=/admin");
    return <main className="admin-denied"><section className="surface"><span>PRIFYN Admin</span><h1>Access restricted.</h1><p>This console is only available to approved PRIFYN operators.</p><a className="button button-dark" href="/app">Back to workspace</a></section></main>;
  }
  const overview = await getAdminOverview();
  return <AdminBusinessManager metrics={overview.metrics} leads={overview.leads} imports={overview.imports} />;
}
