import { z } from "zod";

const Insight = z.object({
  answer: z.string().min(1),
  why: z.string().min(1),
  confidence: z.enum(["low", "medium", "high"]),
  limitations: z.array(z.string()).default([]),
});

export type InsightResponse = z.infer<typeof Insight> & { mode: "live" | "offline" };

type InsightContext = { brand: string; period: string; route: string; evidence?: unknown };

export class AIProviderError extends Error {
  code: string;
  status?: number;
  detail?: string;

  constructor(code: string, message: string, options?: { status?: number; detail?: string }) {
    super(message);
    this.name = "AIProviderError";
    this.code = code;
    this.status = options?.status;
    this.detail = options?.detail;
  }
}

function envValue(key: string) {
  return process.env[key]?.trim().replace(/^["']|["']$/g, "");
}

function chatCompletionsUrl(baseURL: string) {
  const clean = baseURL.trim().replace(/^["']|["']$/g, "").replace(/\/$/, "");
  return clean.endsWith("/chat/completions") ? clean : `${clean}/chat/completions`;
}

function normalizeInsightPayload(value: unknown) {
  const object = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const confidenceRaw = String(object.confidence ?? "medium").toLowerCase();
  const confidence = confidenceRaw.includes("high") ? "high" : confidenceRaw.includes("low") ? "low" : "medium";
  const limitationsRaw = object.limitations;
  const limitations = Array.isArray(limitationsRaw)
    ? limitationsRaw.map(item => String(item)).filter(Boolean)
    : typeof limitationsRaw === "string" && limitationsRaw.trim()
      ? limitationsRaw.split(/\n|;|\.\s+/).map(item => item.trim()).filter(Boolean)
      : [];
  return {
    answer: String(object.answer ?? object.response ?? object.analysis ?? "").trim(),
    why: String(object.why ?? object.reason ?? object.evidence ?? "Based on the available workspace evidence.").trim(),
    confidence,
    limitations,
  };
}

function parseInsightContent(content: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new AIProviderError("AI_BAD_JSON", "AI response was not valid JSON.");
    parsed = JSON.parse(jsonMatch[0]);
  }
  return Insight.parse(normalizeInsightPayload(parsed));
}

function contentFromPayload(payload: unknown) {
  const data = payload as {
    choices?: Array<{
      message?: { content?: string | Array<{ text?: string; content?: string }>; reasoning_content?: string };
      text?: string;
    }>;
    output_text?: string;
    text?: string;
    message?: { content?: string };
  };
  const message = data.choices?.[0]?.message;
  const content = message?.content;
  if (typeof content === "string" && content.trim()) return content;
  if (Array.isArray(content)) {
    const joined = content.map(item => item.text ?? item.content ?? "").join("\n").trim();
    if (joined) return joined;
  }
  const fallbacks = [message?.reasoning_content, data.choices?.[0]?.text, data.output_text, data.text, data.message?.content];
  return fallbacks.find(item => typeof item === "string" && item.trim()) ?? "";
}

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
  const apiKey = envValue("DEEPSEEK_API_KEY");
  const model = envValue("DEEPSEEK_MODEL") || "deepseek-chat";
  if (!apiKey || !model) return offline(question, context);

  const baseURL = envValue("DEEPSEEK_BASE_URL") || "https://api.deepseek.com";
  let response: Response;
  try {
    response = await fetch(chatCompletionsUrl(baseURL), {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are PRIFYN, an evidence-grounded Growth Operating System for brands, agencies, and creators. Return strict JSON with answer, why, confidence (low|medium|high), and limitations. Never invent metrics, creators, campaigns, connected accounts, or revenue. If evidence is missing, say exactly what data to import/connect next. Prefer PRIFYN-supported sources: Meta/TikTok/Google ads exports, GA4, Shopee/Tokopedia order exports, affiliate/coupon reports, creator proof, and UTM links. Do not recommend Shopify or Stripe unless the supplied evidence mentions them. Keep answers concise, operational, and action-oriented." },
        { role: "user", content: `Question: ${question}\nContext: ${JSON.stringify(context)}\nEvidence bundle: ${JSON.stringify(context.evidence ?? { instruction: "Use only imported reports, connected accounts, and campaign activity supplied by PRIFYN. If evidence is missing, say what to connect or import next." })}` },
      ],
    }),
    signal: AbortSignal.timeout(20000),
  });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") throw new AIProviderError("AI_TIMEOUT", "AI analysis took too long.");
    throw new AIProviderError("AI_NETWORK", "AI provider could not be reached.");
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new AIProviderError("AI_PROVIDER_ERROR", `AI provider returned ${response.status}.`, { status: response.status, detail: detail.slice(0, 240) });
  }
  const payload = await response.json();
  const content = contentFromPayload(payload);
  if (!content) throw new AIProviderError("AI_EMPTY_RESPONSE", "AI provider returned no answer.", { detail: JSON.stringify(payload).slice(0, 240) });
  return { ...parseInsightContent(content), mode: "live" };
}
