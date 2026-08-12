export type MetricSummary = {
  hasData: boolean;
  totals: Record<string, number>;
  derived: {
    ctr: number | null;
    cvr: number | null;
    roas: number | null;
    cpc: number | null;
    cpm: number | null;
  };
  importCount: number;
  factCount: number;
  sourceCount: number;
  availableMetrics: Array<{ key: string; label: string; value: number }>;
  bySource: Array<{ source: string; spend: number; revenue: number; impressions: number; clicks: number; orders: number; roas: number | null }>;
  bySubject: Array<{ subjectId: string; subjectType: string; spend: number; revenue: number; impressions: number; clicks: number; orders: number; roas: number | null }>;
  creator: {
    trackedClicks: number;
    orders: number;
    revenue: number;
    creatorCost: number;
    roas: number | null;
  };
};

export function safeDivide(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : null;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: value >= 100000 ? "compact" : "standard", maximumFractionDigits: value >= 100000 ? 1 : 0 }).format(value);
}

export function formatCurrency(value: number) {
  if (!value) return "Rp0";
  if (Math.abs(value) >= 1000000000) return `Rp${(value / 1000000000).toFixed(1)}b`;
  if (Math.abs(value) >= 1000000) return `Rp${(value / 1000000).toFixed(1)}m`;
  if (Math.abs(value) >= 1000) return `Rp${(value / 1000).toFixed(0)}k`;
  return `Rp${Math.round(value).toLocaleString("id-ID")}`;
}

export function formatRatio(value: number | null, suffix = "×") {
  return value === null ? "—" : `${value.toFixed(2)}${suffix}`;
}

export function emptyMetricSummary(): MetricSummary {
  return {
    hasData: false,
    totals: {},
    derived: { ctr: null, cvr: null, roas: null, cpc: null, cpm: null },
    importCount: 0,
    factCount: 0,
    sourceCount: 0,
    availableMetrics: [],
    bySource: [],
    bySubject: [],
    creator: { trackedClicks: 0, orders: 0, revenue: 0, creatorCost: 0, roas: null },
  };
}
