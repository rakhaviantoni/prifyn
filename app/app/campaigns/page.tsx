import { CampaignWorkspace } from "@/components/campaign-workspace";

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const params = await searchParams;
  return <CampaignWorkspace initialCreating={params.new === "true"} />;
}
