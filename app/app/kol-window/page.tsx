import { KolWindow } from "@/components/kol-window";
import { getWorkspaceCampaignSummaries } from "@/lib/campaign-summaries";

export default async function KolWindowPage({ searchParams }: { searchParams?: Promise<{ campaign?: string; step?: string }> }) {
  const params = await searchParams;
  const campaigns = await getWorkspaceCampaignSummaries();
  return <KolWindow initialCampaign={params?.campaign} initialStep={params?.step} campaignOptions={campaigns.map(item => item.name)} />;
}
