import { z } from "zod";
import { productUrl, reportReadyEmail, sendEmail } from "@/lib/email/resend";
import { getWorkspaceContextFromRequest } from "@/lib/workspace-context";

const ReportEmailPayload = z.object({
  view: z.string().trim().min(2).max(80),
  period: z.string().trim().min(2).max(80),
  source: z.string().trim().min(2).max(120),
  outcome: z.string().trim().min(2).max(120),
  to: z.string().trim().email().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const payload = ReportEmailPayload.parse(await request.json());
    const { session, brand } = await getWorkspaceContextFromRequest(request);
    const recipient = payload.to || session.user.email;
    if (!recipient) return Response.json({ ok: false, error: "No recipient email is available." }, { status: 400 });

    const summary = `${payload.view} report for ${payload.period}. Filters: ${payload.source}, ${payload.outcome}. Open PRIFYN to review recommendations, evidence, confidence, and missing data before sharing decisions.`;
    const result = await sendEmail(reportReadyEmail({
      to: recipient,
      workspaceName: brand.name,
      reportName: `${payload.view} report`,
      reportUrl: productUrl("/app/reports"),
      summary,
    }));

    if (!result.ok) return Response.json({ ok: false, error: result.error }, { status: 502 });
    return Response.json({ ok: true, email: result });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof z.ZodError) return Response.json({ ok: false, error: "Report email details are incomplete.", issues: error.issues }, { status: 400 });
    return Response.json({ ok: false, error: "Report email could not be sent." }, { status: 503 });
  }
}
