import { AdsWindow } from "@/components/ads-window";
import { getWorkspaceCampaignSummaries } from "@/lib/campaign-summaries";

export default async function AdsWindowPage({ searchParams }: { searchParams?: Promise<{ campaign?: string; mode?: string }> }) {
  const params = await searchParams;
  const campaigns = await getWorkspaceCampaignSummaries();
  return <AdsWindow initialCampaign={params?.campaign} initialMode={params?.mode} campaigns={campaigns} />;
}
