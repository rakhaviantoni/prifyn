import { TodayDashboard } from "@/components/today-dashboard";

export default async function TodayPage({ searchParams }: { searchParams?: Promise<{ error?: string; code?: string; mode?: string; account?: string }> }) {
  const params = await searchParams;
  const authError = params?.error === "state_mismatch" || params?.code === "state_mismatch";
  return <TodayDashboard authError={authError} accountConflict={params?.account === "brand_only"} />;
}
