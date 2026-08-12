export type ImportSourceType = "meta_ads" | "tiktok_ads" | "google_ads" | "shopee" | "tokopedia" | "affiliate_links";

export type ImportTemplate = {
  id: ImportSourceType;
  label: string;
  platform: string;
  supportedExtensions: string[];
  requiredColumns: string[];
  optionalColumns: string[];
  metricMap: Record<string, string[]>;
  notes: string;
};

export const importTemplates: ImportTemplate[] = [
  {
    id: "meta_ads",
    label: "Meta Ads export",
    platform: "Meta",
    supportedExtensions: [".csv", ".xlsx"],
    requiredColumns: ["Campaign name", "Ad name", "Amount spent (IDR)", "Impressions", "Reach", "Results", "Reporting starts", "Reporting ends"],
    optionalColumns: ["Ad set name", "Delivery status", "Result type", "Cost per result", "Attribution setting", "Quality ranking", "Engagement rate ranking", "Conversion rate ranking"],
    metricMap: {
      campaign_name: ["Campaign name"],
      ad_set_name: ["Ad set name", "Ad set name.1"],
      ad_name: ["Ad name"],
      delivery_status: ["Delivery status"],
      result_type: ["Result type"],
      results: ["Results", "Results (initial)"],
      cost_per_result_idr: ["Cost per result"],
      spend_idr: ["Amount spent (IDR)", "Amount spent"],
      impressions: ["Impressions"],
      reach: ["Reach"],
      attribution_setting: ["Attribution setting"],
      reporting_starts: ["Reporting starts", "Day"],
      reporting_ends: ["Reporting ends"],
    },
    notes: "Matches the attached Meta export: campaign/ad hierarchy, delivery status, result type, spend, reach, impressions, attribution, and reporting window.",
  },
  {
    id: "tiktok_ads",
    label: "TikTok Ads export",
    platform: "TikTok",
    supportedExtensions: [".csv", ".xlsx"],
    requiredColumns: ["Campaign name", "Ad group name", "Ad name", "Cost", "Impressions", "Clicks"],
    optionalColumns: ["Reach", "Conversions", "Orders", "Complete payment", "CTR", "CVR", "ROAS", "Currency", "Date"],
    metricMap: {
      campaign_name: ["Campaign name", "Campaign"],
      ad_set_name: ["Ad group name", "Ad group"],
      ad_name: ["Ad name", "Ad"],
      spend_idr: ["Cost", "Spend", "Amount spent"],
      impressions: ["Impressions"],
      reach: ["Reach"],
      clicks: ["Clicks"],
      conversions: ["Conversions", "Orders", "Complete payment"],
      ctr: ["CTR"],
      cvr: ["CVR", "Conversion rate"],
      roas: ["ROAS"],
      reporting_starts: ["Date", "Reporting starts"],
    },
    notes: "Use this when TikTok Ads connection is not ready yet. PRIFYN keeps the original export and prepares supported metrics for reports.",
  },
  {
    id: "google_ads",
    label: "Google Ads export",
    platform: "Google",
    supportedExtensions: [".csv", ".xlsx"],
    requiredColumns: ["Campaign", "Cost", "Impr.", "Clicks"],
    optionalColumns: ["Conversions", "Conv. value", "CTR", "Avg. CPC", "Cost / conv.", "Day"],
    metricMap: {
      campaign_name: ["Campaign", "Campaign name"],
      ad_set_name: ["Ad group", "Ad group name"],
      spend_idr: ["Cost", "Cost (IDR)", "Amount spent"],
      impressions: ["Impr.", "Impressions"],
      clicks: ["Clicks"],
      conversions: ["Conversions", "All conv."],
      revenue_idr: ["Conv. value", "Conversion value", "Revenue"],
      ctr: ["CTR"],
      cost_per_result_idr: ["Cost / conv.", "Avg. CPC"],
      reporting_starts: ["Day", "Date"],
    },
    notes: "Google login is identity only. Google Ads import or OAuth authorization is a separate permission flow.",
  },
  {
    id: "shopee",
    label: "Shopee Ads / order export",
    platform: "Shopee",
    supportedExtensions: [".csv", ".xlsx"],
    requiredColumns: ["Campaign Name", "Expense", "Impressions", "Clicks"],
    optionalColumns: ["Orders", "GMV", "CTR", "CIR", "ROAS", "Date", "Product Name"],
    metricMap: {
      campaign_name: ["Campaign Name", "Campaign"],
      product_name: ["Product Name", "Item Name"],
      spend_idr: ["Expense", "Spend", "Cost"],
      impressions: ["Impressions"],
      clicks: ["Clicks"],
      orders: ["Orders", "Order"],
      revenue_idr: ["GMV", "Revenue", "Sales"],
      ctr: ["CTR"],
      roas: ["ROAS"],
      reporting_starts: ["Date"],
    },
    notes: "Useful for marketplace seller flows where PRIFYN operates like an agency until partner API access is approved.",
  },
  {
    id: "tokopedia",
    label: "Tokopedia Ads / order export",
    platform: "Tokopedia",
    supportedExtensions: [".csv", ".xlsx"],
    requiredColumns: ["Campaign", "Spend", "Impressions", "Clicks"],
    optionalColumns: ["Orders", "Revenue", "ROAS", "CTR", "Date", "Product"],
    metricMap: {
      campaign_name: ["Campaign", "Campaign Name"],
      product_name: ["Product", "Product Name"],
      spend_idr: ["Spend", "Cost"],
      impressions: ["Impressions"],
      clicks: ["Clicks"],
      orders: ["Orders"],
      revenue_idr: ["Revenue", "GMV", "Sales"],
      ctr: ["CTR"],
      roas: ["ROAS"],
      reporting_starts: ["Date"],
    },
    notes: "Prepared for manual marketplace performance import while official partner access is pending.",
  },
  {
    id: "affiliate_links",
    label: "Affiliate / coupon tracking",
    platform: "Manual tracking",
    supportedExtensions: [".csv", ".xlsx"],
    requiredColumns: ["Campaign", "Creator", "Clicks", "Orders"],
    optionalColumns: ["Coupon", "Destination URL", "Revenue", "Cost", "Date", "Platform"],
    metricMap: {
      campaign_name: ["Campaign", "Campaign name"],
      creator_name: ["Creator", "KOL", "Influencer"],
      platform: ["Platform"],
      clicks: ["Clicks"],
      orders: ["Orders", "Conversions"],
      revenue_idr: ["Revenue", "GMV", "Sales"],
      creator_cost_idr: ["Cost", "Creator cost"],
      coupon_code: ["Coupon", "Coupon code"],
      destination_url: ["Destination URL", "Landing Page", "URL"],
      reporting_starts: ["Date"],
    },
    notes: "This closes KOL attribution before every platform API exists: tracked links, coupon codes, proof uploads, and manual orders.",
  },
];

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function detectImportTemplate(headers: string[]) {
  const normalizedHeaders = new Set(headers.map(normalize));
  const scored = importTemplates.map(template => {
    const required = template.requiredColumns.filter(column => normalizedHeaders.has(normalize(column))).length;
    const optional = template.optionalColumns.filter(column => normalizedHeaders.has(normalize(column))).length;
    return { template, score: required * 4 + optional, required };
  }).sort((a, b) => b.score - a.score);
  return scored[0]?.score ? scored[0] : null;
}

export function mapHeaders(headers: string[], template: ImportTemplate) {
  const normalized = new Map(headers.map(header => [normalize(header), header]));
  return Object.fromEntries(Object.entries(template.metricMap).map(([metric, candidates]) => [
    metric,
    candidates.map(normalize).map(candidate => normalized.get(candidate)).find(Boolean) ?? null,
  ]));
}

export function parseCsvPreview(input: string) {
  const rows = input
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter(row => row.trim().length > 0)
    .map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.trim().replace(/^"|"$/g, "")));
  const headers = rows[0] ?? [];
  return { headers, rows: rows.slice(1), totalRows: Math.max(rows.length - 1, 0) };
}
