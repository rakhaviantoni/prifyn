import { z } from "zod";
import { generateInsight } from "@/lib/ai/provider";

const RequestBody = z.object({ question: z.string().trim().min(3).max(500) });

export async function POST(request: Request) {
  try {
    const body = RequestBody.parse(await request.json());
    return Response.json(await generateInsight(body.question));
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ code: "INVALID_QUESTION", issues: error.issues }, { status: 400 });
    return Response.json({ code: "AI_UNAVAILABLE", message: "The analysis could not be completed. No business record was changed." }, { status: 503 });
  }
}
