import { AppShell } from "@/components/app-shell";
import { TodayDashboard } from "@/components/today-dashboard";

export default function DemoPage() {
  return <AppShell currentUser={{ name: "Demo Owner", email: "demo@prifyn.com" }}><TodayDashboard previewMode /></AppShell>;
}
