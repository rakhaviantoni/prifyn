import type { Metadata } from "next";
import { CreatorShell } from "@/components/creator-shell";
export const metadata: Metadata = { title: "Creator workspace" };
export default function CreatorLayout({ children }: { children: React.ReactNode }) { return <CreatorShell>{children}</CreatorShell>; }
