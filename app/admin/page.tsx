import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminBusinessManager } from "@/components/admin-business-manager";
import { getAdminSession } from "@/lib/admin/access";

export const metadata = { title: "PRIFYN Business Manager" };

const emptyOverview = {
  metrics: { users: 0, workspaces: 0, operatingBrands: 0, leads: 0, imports: 0, webhooks: 0 },
  leads: [],
  imports: [],
};

export default async function AdminPage() {
  const requestHeaders = await headers();
  const admin = await getAdminSession(requestHeaders);
  if (!admin) {
    const cookie = requestHeaders.get("cookie") ?? "";
    if (!cookie.includes("better-auth")) redirect("/auth/sign-in?returnTo=/admin");
    return <main className="admin-denied"><section className="surface"><span>PRIFYN Admin</span><h1>Access restricted.</h1><p>This console is only available to approved PRIFYN operators.</p><a className="button button-dark" href="/app">Back to workspace</a></section></main>;
  }
  return <AdminBusinessManager metrics={emptyOverview.metrics} leads={emptyOverview.leads} imports={emptyOverview.imports} loadOverview />;
}
