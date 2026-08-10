import { SiGoogleads, SiMeta, SiShopee, SiTiktok } from "@icons-pack/react-simple-icons";

const iconProps = { size: 22, "aria-hidden": true } as const;

export function ChannelLogo({ channel }: { channel: string }) {
  if (channel === "Meta") return <SiMeta {...iconProps} color="#0866FF" />;
  if (channel === "Google") return <SiGoogleads {...iconProps} color="#4285F4" />;
  if (channel === "TikTok") return <SiTiktok {...iconProps} color="currentColor" />;
  if (channel === "Shopee") return <SiShopee {...iconProps} color="#EE4D2D" />;
  // The official Tokopedia wordmark is not included in Simple Icons.
  // eslint-disable-next-line @next/next/no-img-element
  if (channel === "Tokopedia") return <img src="/tokopedia.svg" alt="" />;
  return <span aria-hidden="true">{channel.slice(0, 2).toUpperCase()}</span>;
}
