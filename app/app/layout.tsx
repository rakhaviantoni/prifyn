import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { requireWorkspaceSession } from "@/lib/auth/guard";
export const metadata: Metadata = { title: "Workspace" };
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  await requireWorkspaceSession("/app");
  return <AppShell>{children}</AppShell>;
}
