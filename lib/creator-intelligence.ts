import { z } from "zod";

export const creatorApplicationSchema = z.object({
  campaignId: z.string().uuid(),
  creatorProfileId: z.string().uuid(),
  proposal: z.string().min(40).max(3000),
  proposedRateMinor: z.number().int().nonnegative().optional(),
  portfolioItemIds: z.array(z.string().uuid()).max(12).default([]),
});

export const creatorSearchSchema = z.object({
  query: z.string().max(120).optional(),
  platform: z.enum(["tiktok", "instagram", "youtube", "facebook", "lemon8", "x", "website"]).optional(),
  location: z.string().max(120).optional(),
  niche: z.string().max(80).optional(),
  verified: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const creatorPermissions = {
  owner: ["creator:read", "creator:invite", "creator:review", "creator:select", "payment:approve", "team:manage"],
  orgAdmin: ["creator:read", "creator:invite", "creator:review", "creator:select", "team:manage"],
  campaignManager: ["creator:read", "creator:invite", "creator:review", "creator:select"],
  reviewer: ["creator:read", "creator:review"],
  finance: ["creator:read", "payment:read", "payment:approve"],
  analyst: ["creator:read", "report:read"],
  creator: ["own_profile:manage", "opportunity:read", "application:manage", "own_payment:read"],
} as const;

export function creatorConnectorReadiness() {
  return {
    identity: { google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) },
    intelligence: { sumopod: Boolean(process.env.SUMOPOD_API_KEY), mode: process.env.SUMOPOD_API_KEY ? "configured" : "explainable-demo" },
    social: {
      tiktok: { mode: "public-link", api: false },
      instagram: { mode: "public-link", api: false },
      youtube: { mode: "public-link", api: false },
    },
    storage: { r2: false, mode: "public-links" },
    payments: { provider: null, mode: "status-tracking" },
  };
}
