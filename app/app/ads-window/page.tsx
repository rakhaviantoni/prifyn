import { AdsWindow } from "@/components/ads-window";
import { getWorkspaceAdSummaries, getWorkspaceCampaignSummaries } from "@/lib/campaign-summaries";

export default async function AdsWindowPage({ searchParams }: { searchParams?: Promise<{ campaign?: string; mode?: string }> }) {
  const params = await searchParams;
  const [campaigns, ads] = await Promise.all([getWorkspaceCampaignSummaries(), getWorkspaceAdSummaries()]);
  return <AdsWindow initialCampaign={params?.campaign} initialMode={params?.mode} campaigns={campaigns} ads={ads} />;
}
