import { CampaignWorkspace } from "@/components/campaign-workspace";
import { getWorkspaceCampaignSummaries } from "@/lib/campaign-summaries";

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const params = await searchParams;
  const campaigns = await getWorkspaceCampaignSummaries();
  return <CampaignWorkspace initialCreating={params.new === "true"} initialCampaigns={campaigns} />;
}
