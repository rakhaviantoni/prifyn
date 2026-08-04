import { notFound } from "next/navigation";
import { CreatorProfileView } from "@/components/creator-profile-view";
import { creatorProfiles } from "@/lib/creator-intelligence-data";

export function generateStaticParams() { return creatorProfiles.map(creator => ({ creatorId: creator.id })); }

export default async function CreatorProfilePage({ params }: { params: Promise<{ creatorId: string }> }) {
  const { creatorId } = await params;
  const creator = creatorProfiles.find(item => item.id === creatorId);
  if (!creator) notFound();
  return <CreatorProfileView creator={creator} />;
}
