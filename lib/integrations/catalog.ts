export const integrationCatalog = {
  meta: {
    label: "Meta",
    auth: "Facebook Login for Business",
    credentials: ["META_APP_ID", "META_APP_SECRET", "META_LOGIN_CONFIG_ID"],
    capabilities: ["Ad accounts", "Instagram identities", "Campaign publishing", "Insights"],
  },
  google: {
    label: "Google Ads",
    auth: "OAuth 2.0 multi-user flow",
    credentials: ["GOOGLE_ADS_CLIENT_ID", "GOOGLE_ADS_CLIENT_SECRET", "GOOGLE_ADS_DEVELOPER_TOKEN"],
    capabilities: ["Customer accounts", "Campaign publishing", "Conversion actions", "Reporting"],
  },
  tiktok: {
    label: "TikTok for Business",
    auth: "Marketing API advertiser authorization",
    credentials: ["TIKTOK_BUSINESS_APP_ID", "TIKTOK_BUSINESS_APP_SECRET"],
    capabilities: ["Advertiser accounts", "Identity selection", "Campaign publishing", "Reporting"],
  },
  tokopedia: {
    label: "Tokopedia",
    auth: "Approved partner authorization",
    credentials: ["TOKOPEDIA_PARTNER_ID", "TOKOPEDIA_PARTNER_SECRET"],
    capabilities: ["Seller account", "Shop data", "Orders and attribution when approved"],
  },
  shopee: {
    label: "Shopee",
    auth: "Open Platform shop authorization",
    credentials: ["SHOPEE_PARTNER_ID", "SHOPEE_PARTNER_KEY"],
    capabilities: ["Authorized shops", "Shop data", "Orders and attribution when approved"],
  },
} as const;

export function publicIntegrationReadiness() {
  return Object.entries(integrationCatalog).map(([id, provider]) => ({
    id,
    label: provider.label,
    auth: provider.auth,
    capabilities: provider.capabilities,
    configured: provider.credentials.every(key => Boolean(process.env[key])),
  }));
}
