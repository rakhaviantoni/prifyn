import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { requirePortalSession } from "@/lib/auth/guard";
export const metadata: Metadata = { title: "Workspace" };
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { session } = await requirePortalSession("/app", "app");
  return <AppShell currentUser={{ name: session.user.name, email: session.user.email }}>{children}</AppShell>;
}
