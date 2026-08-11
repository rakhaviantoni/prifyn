export type CreatorScore = {
  label: string;
  score: number;
  confidence: number;
  reason: string;
  improvement: string;
};

export type CreatorProfile = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  location: string;
  languages: string[];
  niches: string[];
  platforms: string[];
  followers: string;
  engagement: string;
  averageViews: string;
  fit: number;
  rate: string;
  verification: "Verified" | "Gold" | "Top Creator" | "Review";
  availability: string;
  summary: string;
  strengths: string[];
  risk: string;
  scores: CreatorScore[];
};

const sharedScores: CreatorScore[] = [
  { label: "Brand safety", score: 94, confidence: 92, reason: "No flagged themes across 48 recent public posts and previous brand work.", improvement: "Keep sponsored-content disclosures consistent." },
  { label: "Storytelling", score: 91, confidence: 89, reason: "Strong first-three-second hooks and clear problem-to-payoff narratives.", improvement: "Test shorter calls to action for conversion content." },
  { label: "Audience quality", score: 88, confidence: 84, reason: "Audience location and engagement patterns align with the campaign target.", improvement: "Connect a first-party audience export to raise confidence." },
  { label: "Campaign readiness", score: 90, confidence: 91, reason: "On-time delivery in four recent collaborations with low revision volume.", improvement: "Confirm availability before final selection." },
];

export const creatorProfiles: CreatorProfile[] = [
  { id: "nabila-putri", name: "Nabila Putri", handle: "@nabilaeats", initials: "NP", location: "Jakarta", languages: ["Bahasa Indonesia", "English"], niches: ["Food", "Lifestyle", "FMCG"], platforms: ["TikTok", "Instagram"], followers: "428K", engagement: "6.8%", averageViews: "184K", fit: 96, rate: "Rp8–12 jt", verification: "Top Creator", availability: "Available from 18 Aug", summary: "Food creator based in Jakarta with natural product integration, strong storytelling, and a highly relevant urban audience.", strengths: ["Jakarta audience", "Natural product integration", "Reliable delivery"], risk: "Posting consistency softened in the last 30 days.", scores: sharedScores },
  { id: "ardian-prakoso", name: "Ardian Prakoso", handle: "@ardianfamily", initials: "AP", location: "Bandung", languages: ["Bahasa Indonesia"], niches: ["Family", "Parenting", "Home"], platforms: ["Instagram", "YouTube"], followers: "276K", engagement: "5.4%", averageViews: "96K", fit: 89, rate: "Rp6–9 jt", verification: "Gold", availability: "Available now", summary: "Family storyteller with durable trust, thoughtful reviews, and strong comment quality among young parents.", strengths: ["High audience trust", "Detailed reviews", "Strong saves"], risk: "Longer production lead time than campaign average.", scores: sharedScores.map((score, index) => ({ ...score, score: score.score - index * 2 })) },
  { id: "dimas-wibowo", name: "Dimas Wibowo", handle: "@dimastries", initials: "DW", location: "Surabaya", languages: ["Bahasa Indonesia", "Javanese"], niches: ["Food", "Value", "Local discovery"], platforms: ["TikTok"], followers: "192K", engagement: "8.1%", averageViews: "122K", fit: 86, rate: "Rp4–7 jt", verification: "Verified", availability: "2 slots this month", summary: "Fast-moving local discovery creator with above-benchmark engagement and clear value-led hooks.", strengths: ["Above-benchmark CTR", "Local authority", "Fast turnaround"], risk: "Portfolio has limited premium-brand examples.", scores: sharedScores.map(score => ({ ...score, score: score.score - 4 })) },
  { id: "sarah-amalia", name: "Sarah Amalia", handle: "@sarahcooks", initials: "SA", location: "Jakarta", languages: ["Bahasa Indonesia", "English"], niches: ["Food", "Recipes", "UGC"], platforms: ["TikTok", "Instagram"], followers: "84K", engagement: "9.2%", averageViews: "71K", fit: 82, rate: "Rp3–5 jt", verification: "Review", availability: "Available now", summary: "Emerging recipe and UGC creator with high engagement and polished visual execution.", strengths: ["High engagement", "Strong editing", "Flexible UGC formats"], risk: "Audience demographics are self-reported and need verification.", scores: sharedScores.map(score => ({ ...score, score: score.score - 7, confidence: score.confidence - 8 })) },
  { id: "kevin-tan", name: "Kevin Tan", handle: "@kevinbuilds", initials: "KT", location: "Tangerang", languages: ["Bahasa Indonesia", "English"], niches: ["Business", "Technology", "Productivity"], platforms: ["YouTube", "Instagram"], followers: "318K", engagement: "4.7%", averageViews: "108K", fit: 78, rate: "Rp10–15 jt", verification: "Gold", availability: "Available from September", summary: "Credible business educator with production quality suited to considered-purchase campaigns.", strengths: ["Executive audience", "Excellent production", "Clear explanations"], risk: "Premium rate and lower short-form posting frequency.", scores: sharedScores.map(score => ({ ...score, score: score.score - 5 })) },
  { id: "alya-pratama", name: "Alya Pratama", handle: "@alyamoves", initials: "AL", location: "Bali", languages: ["Bahasa Indonesia", "English"], niches: ["Wellness", "Travel", "Lifestyle"], platforms: ["TikTok", "Instagram", "YouTube"], followers: "156K", engagement: "7.3%", averageViews: "87K", fit: 75, rate: "Rp5–8 jt", verification: "Verified", availability: "1 slot this month", summary: "Bilingual lifestyle creator with distinctive visuals and an engaged wellness community.", strengths: ["Bilingual delivery", "Visual consistency", "Travel audience"], risk: "Location fit is weaker for Jakarta-only activations.", scores: sharedScores.map(score => ({ ...score, score: score.score - 6 })) },
];

export const creatorOpportunities = [
  { id: "ramadan-made-simple", title: "Ramadan Made Simple", brand: "Nusa Spice", fit: 96, budget: "Rp8-12 jt", deadline: "12 Aug", deliverable: "2 TikTok videos + 3 stories", status: "Open" },
  { id: "weekday-lunch-reset", title: "Weekday Lunch Reset", brand: "Dapur Saji", fit: 89, budget: "Rp5-8 jt", deadline: "16 Aug", deliverable: "1 Reel + usage rights", status: "Open" },
  { id: "workspace", title: "Work Better, Naturally", brand: "Kawan Office", fit: 82, budget: "Rp6–10 jt", deadline: "22 Aug", deliverable: "1 YouTube integration", status: "Invite only" },
];

export const teamMembers = [
  { name: "Rakha Antoni", email: "rakha@nusa.co", initials: "RA", role: "Owner", scope: "All organizations", status: "Active" },
  { name: "Maya Putri", email: "maya@nusa.co", initials: "MP", role: "Campaign Manager", scope: "Nusa Spice", status: "Active" },
  { name: "Dewi Rahman", email: "dewi@nusa.co", initials: "DR", role: "Reviewer", scope: "Nusa Spice, Dapur Saji", status: "Active" },
  { name: "Andi Wijaya", email: "andi@nusa.co", initials: "AW", role: "Finance", scope: "All organizations", status: "Invited" },
];
