import type { Metadata } from "next";
import { CreatorShell } from "@/components/creator-shell";
import { requireWorkspaceSession } from "@/lib/auth/guard";
export const metadata: Metadata = { title: "Creator workspace" };
export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireWorkspaceSession("/creator");
  return <CreatorShell currentUser={{ name: session.user.name, email: session.user.email }}>{children}</CreatorShell>;
}
