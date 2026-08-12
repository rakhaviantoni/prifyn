import { z } from "zod";

const Insight = z.object({
  answer: z.string().min(1),
  why: z.string().min(1),
  confidence: z.enum(["low", "medium", "high"]),
  limitations: z.array(z.string()).default([]),
});

export type InsightResponse = z.infer<typeof Insight> & { mode: "live" | "offline" };

type InsightContext = { brand: string; period: string; route: string; evidence?: unknown };

function offline(question: string, context: InsightContext): InsightResponse {
  const normalized = question.toLowerCase();
  const scope = `Scoped to ${context.brand} · ${context.period}.`;
  const topic = normalized.includes("creator") ? "creator performance" : normalized.includes("risk") ? "campaign risk" : normalized.includes("revenue") || normalized.includes("roas") ? "revenue and ROAS" : "growth performance";
  return {
    mode: "offline",
    answer: `I cannot analyze ${topic} yet because the AI provider is not connected for this workspace. Connect the AI provider and add the relevant reports first, then PRIFYN can answer with evidence, confidence, and recommended actions.`,
    why: `${scope} No AI provider response was available, so PRIFYN did not generate a business recommendation.`,
    confidence: "low",
    limitations: ["AI provider is not connected", "Answer needs imported reports or connected channel data"],
  };
}

export async function generateInsight(question: string, suppliedContext?: InsightContext): Promise<InsightResponse> {
  const context = suppliedContext ?? { brand: "Selected brand", period: "Last 7 days", route: "/app/copilot" };
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  if (!apiKey || !model) return offline(question, context);

  const baseURL = (process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1").replace(/\/$/, "");
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are PRIFYN, an evidence-grounded Growth Operating System for brands, agencies, and creators. Return strict JSON with answer, why, confidence (low|medium|high), and limitations. Never invent metrics, creators, campaigns, connected accounts, or revenue. If evidence is missing, say exactly what data to import/connect next. Keep answers concise, operational, and action-oriented." },
        { role: "user", content: `Question: ${question}\nContext: ${JSON.stringify(context)}\nEvidence bundle: ${JSON.stringify(context.evidence ?? { instruction: "Use only imported reports, connected accounts, and campaign activity supplied by PRIFYN. If evidence is missing, say what to connect or import next." })}` },
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
