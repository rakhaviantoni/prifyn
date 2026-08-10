import { z } from "zod";

const Insight = z.object({
  answer: z.string().min(1),
  why: z.string().min(1),
  confidence: z.enum(["low", "medium", "high"]),
  limitations: z.array(z.string()).default([]),
});

export type InsightResponse = z.infer<typeof Insight> & { mode: "live" | "demo" };

const demoEvidence = {
  revenue: "Attributed revenue is Rp 86.4m, up 12.8% week over week.",
  roas: "Blended campaign ROAS is 3.42x, down 4.1% week over week.",
  cost: "Paid amplification cost rose 24% while conversion volume remained stable.",
  creators: "Nabila Putri generated Rp 18.2m attributed revenue at 4.6x ROAS.",
  delivery: "One Weekend Family Feast deliverable is two days overdue.",
};

type InsightContext = { brand: string; period: string; route: string };

function demo(question: string, context: InsightContext): InsightResponse {
  const normalized = question.toLowerCase();
  const scope = `Scoped to ${context.brand} · ${context.period}.`;
  if (normalized.includes("creator") || normalized.includes("performed best")) return { mode: "demo", answer: "Nabila Putri is the strongest current performer at 4.6× ROAS and Rp 18.2m attributed revenue. Her food-storytelling format also has the strongest match with the active Ramadan campaign.", why: `${scope} ${demoEvidence.creators} This combines attributed outcome and campaign fit rather than follower count alone`, confidence: "high", limitations: ["Last-touch attribution", "Audience metrics are manually refreshed"] };
  if (normalized.includes("risk") || normalized.includes("overdue")) return { mode: "demo", answer: "Weekend Family Feast has the highest immediate delivery risk. Contact Dimas today and agree on a revised draft deadline before the Friday publication slot is lost.", why: `${scope} ${demoEvidence.delivery}`, confidence: "high", limitations: ["No direct creator-message integration yet"] };
  if (normalized.includes("improve") || normalized.includes("month")) return { mode: "demo", answer: "Protect the current creator mix and run a seven-day 15% reduction in paid amplification. Assign the experiment to the campaign owner and review blended ROAS next Monday.", why: `${scope} ${demoEvidence.roas} ${demoEvidence.cost}`, confidence: "high", limitations: ["Recommendation is based on seven days of data", "No incrementality test is available"] };
  return { mode: "demo", answer: "ROAS declined because paid amplification cost rose while creator-led conversion held steady. Reduce amplification by 15% for seven days; do not change the creator mix yet.", why: `${scope} ${demoEvidence.roas} ${demoEvidence.cost}`, confidence: "high", limitations: ["Last-touch, seven-day attribution window", "Preview evidence only"] };
}

export async function generateInsight(question: string, suppliedContext?: InsightContext): Promise<InsightResponse> {
  const context = suppliedContext ?? { brand: "Nusa Spice Group", period: "Last 7 days", route: "/app/copilot" };
  const apiKey = process.env.SUMOPOD_API_KEY;
  const model = process.env.SUMOPOD_MODEL;
  if (!apiKey || !model) return demo(question, context);

  const baseURL = (process.env.SUMOPOD_BASE_URL ?? "https://ai.sumopod.com/v1").replace(/\/$/, "");
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are PRIFYN, an evidence-grounded Growth Operating System. Return JSON with answer, why, confidence (low|medium|high), and limitations. Never claim evidence outside the provided bundle. Prefer a clear next action." },
        { role: "user", content: `Question: ${question}\nContext: ${JSON.stringify(context)}\nEvidence bundle: ${JSON.stringify(demoEvidence)}` },
      ],
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI provider returned no content");
  return { ...Insight.parse(JSON.parse(content)), mode: "live" };
}
