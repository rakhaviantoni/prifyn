import { CreatorPreviewDashboard } from "@/components/creator-preview-dashboard";
import { CreatorShell } from "@/components/creator-shell";

export default function CreatorDemoPage() {
  return <CreatorShell currentUser={{ name: "Demo Creator", email: "creator-demo@prifyn.com" }}><CreatorPreviewDashboard /></CreatorShell>;
}
