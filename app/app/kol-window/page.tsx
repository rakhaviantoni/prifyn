import { KolWindow } from "@/components/kol-window";

export default async function KolWindowPage({ searchParams }: { searchParams?: Promise<{ campaign?: string; step?: string }> }) {
  const params = await searchParams;
  return <KolWindow initialCampaign={params?.campaign} initialStep={params?.step} />;
}
