import { z } from "zod";
import { AIProviderError, generateInsight } from "@/lib/ai/provider";

const RequestBody = z.object({ question: z.string().trim().min(3).max(500), context: z.object({ brand: z.string().trim().min(1).max(120), period: z.string().trim().max(80), route: z.string().trim().max(200), evidence: z.unknown().optional() }).optional() });

export async function POST(request: Request) {
  try {
    const body = RequestBody.parse(await request.json());
    return Response.json(await generateInsight(body.question, body.context));
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ code: "INVALID_QUESTION", issues: error.issues }, { status: 400 });
    if (error instanceof AIProviderError) return Response.json({
      code: error.code,
      message: error.message,
      status: error.status,
      detail: error.detail,
      safe: "No business record was changed.",
    }, { status: error.status && error.status >= 400 && error.status < 500 ? 502 : 503 });
    return Response.json({ code: "AI_UNAVAILABLE", message: "The analysis could not be completed.", safe: "No business record was changed." }, { status: 503 });
  }
}
