export type CreatorBrief = {
  id: string;
  title: string;
  brand: string;
  brandInitials: string;
  objective: string;
  status: string;
  campaignWindow: string;
  applicationDeadline: string;
  approvedVersion: string;
  fit: number;
  budget: string;
  creatorFee: string;
  paymentMilestones: Array<{ label: string; amount: string; status: string; expected: string }>;
  platforms: string[];
  deliverables: Array<{ title: string; detail: string; due: string; status: string }>;
  kpis: Array<{ label: string; target: string }>;
  detailBrief: string;
  contentRequirements: string[];
  doList: string[];
  dontList: string[];
  usageRights: string;
  revisionLimit: string;
  tracking: {
    link: string;
    coupon: string;
    requiredProof: string[];
  };
  brandContact: {
    name: string;
    role: string;
    responseTime: string;
  };
  proposalDefaults: {
    rate: string;
    note: string;
    portfolio: string;
  };
};

export const creatorBriefs: CreatorBrief[] = [
  {
    id: "ramadan-made-simple",
    title: "Ramadan Made Simple",
    brand: "Nusa Spice",
    brandInitials: "NS",
    objective: "Sales / Order",
    status: "In production",
    campaignWindow: "20-24 Aug 2026",
    applicationDeadline: "12 Aug 2026",
    approvedVersion: "Brand brief v3",
    fit: 96,
    budget: "Rp8-12 jt",
    creatorFee: "Rp10.000.000",
    paymentMilestones: [
      { label: "Agreement accepted", amount: "Rp4.000.000", status: "Approved", expected: "31 Jul 2026" },
      { label: "Final content approval", amount: "Rp6.000.000", status: "Pending", expected: "30 Aug 2026" },
    ],
    platforms: ["TikTok", "Instagram Stories"],
    deliverables: [
      { title: "TikTok video 1", detail: "18-25s practical meal story", due: "12 Aug 2026 · 17:00 WIB", status: "First cut due" },
      { title: "TikTok video 2", detail: "Variation with stronger product payoff", due: "14 Aug 2026 · 17:00 WIB", status: "Planned" },
      { title: "Instagram Stories", detail: "3-frame story with link sticker and coupon", due: "20 Aug 2026 · 18:00 WIB", status: "Scheduled" },
    ],
    kpis: [
      { label: "Primary KPI", target: "Tracked orders" },
      { label: "Target", target: "1.200 orders" },
      { label: "CTA", target: "Shop Now" },
      { label: "Reporting", target: "Link + coupon + proof" },
    ],
    detailBrief: "Show how Nusa Spice makes family iftar preparation easier. Content must feel practical, warm, and locally relevant. Start with a real weekday problem, introduce the product naturally, and end with a clear meal result. Avoid a scripted endorsement tone.",
    contentRequirements: [
      "Show one preparation moment before the product result.",
      "Mention the Ramadan bundle and use the campaign CTA.",
      "Caption must include the tracked link, coupon code, and #NusaSpiceRamadan.",
      "Submit rough cut before publishing. Brand review SLA is two business days.",
    ],
    doList: ["Use natural Bahasa Indonesia", "Show family-serving moment", "Keep product visible before second 7"],
    dontList: ["No competitor mention", "No exaggerated health claims", "Do not publish before approval"],
    usageRights: "90 days paid social amplification on Meta, TikTok, and brand-owned channels. Whitelisting requires separate approval.",
    revisionLimit: "Up to 2 rounds included; additional rounds require creator approval.",
    tracking: {
      link: "https://ramadan.nusaspice.id/?ref=nabila",
      coupon: "NABILA10",
      requiredProof: ["Published URL", "Story screenshots", "Native platform metrics after 72 hours", "Coupon/link result snapshot if available"],
    },
    brandContact: { name: "Maya Putri", role: "Campaign Manager", responseTime: "Usually replies within 1 business day" },
    proposalDefaults: {
      rate: "Rp10.000.000",
      note: "My food audience regularly saves practical recipe content. I can deliver a warm Ramadan story with clear product payoff and tracked CTA.",
      portfolio: "https://tiktok.com/@nabilaeats",
    },
  },
  {
    id: "weekday-lunch-reset",
    title: "Weekday Lunch Reset",
    brand: "Dapur Saji",
    brandInitials: "DS",
    objective: "Leads / Sales",
    status: "Shortlisted",
    campaignWindow: "26-30 Aug 2026",
    applicationDeadline: "16 Aug 2026",
    approvedVersion: "Brand brief v1",
    fit: 89,
    budget: "Rp5-8 jt",
    creatorFee: "Rp7.500.000 proposed",
    paymentMilestones: [{ label: "Selection agreement", amount: "Rp7.500.000", status: "Waiting brand approval", expected: "18 Aug 2026" }],
    platforms: ["Instagram Reels"],
    deliverables: [{ title: "Instagram Reel", detail: "30s lunch-prep story + usage rights", due: "24 Aug 2026", status: "Awaiting final selection" }],
    kpis: [{ label: "Primary KPI", target: "Lead form starts" }, { label: "CTA", target: "See Details" }],
    detailBrief: "Show practical lunch reset ideas for busy office workers. Brand wants a creator-led story, not a polished studio ad.",
    contentRequirements: ["One Reel", "Caption CTA", "One usage-rights confirmation"],
    doList: ["Show before/after lunch prep", "Mention time saved"],
    dontList: ["Do not compare directly with competitors", "No unverified nutrition claims"],
    usageRights: "60 days organic + paid usage on brand-owned channels.",
    revisionLimit: "1 round included.",
    tracking: { link: "https://dapursaji.id/lunch?ref=nabila", coupon: "LUNCHNABILA", requiredProof: ["Published URL", "48h metrics"] },
    brandContact: { name: "Dewi Rahman", role: "Brand Reviewer", responseTime: "Usually replies within 2 business days" },
    proposalDefaults: { rate: "Rp7.500.000", note: "I can create a practical lunch-prep story for working audiences.", portfolio: "https://instagram.com/nabilaeats" },
  },
];

export function getCreatorBrief(id = "ramadan-made-simple") {
  return creatorBriefs.find(brief => brief.id === id) ?? creatorBriefs[0];
}
