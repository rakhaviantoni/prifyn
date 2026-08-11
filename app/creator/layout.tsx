import type { Metadata } from "next";
import { CreatorShell } from "@/components/creator-shell";
import { requirePortalSession } from "@/lib/auth/guard";
export const metadata: Metadata = { title: "Creator workspace" };
export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { session } = await requirePortalSession("/creator", "creator");
  return <CreatorShell currentUser={{ name: session.user.name, email: session.user.email }}>{children}</CreatorShell>;
}
