import { simpleReportPdf } from "@/lib/reports/pdf";
import { getWorkspaceContextFromRequest } from "@/lib/workspace-context";

export async function GET(request: Request) {
  try {
    const { brand } = await getWorkspaceContextFromRequest(request);
    const url = new URL(request.url);
    const view = url.searchParams.get("view") || "Executive";
    const period = url.searchParams.get("period") || "Last 30 days";
    const source = url.searchParams.get("source") || "All sources";
    const outcome = url.searchParams.get("outcome") || "All outcomes";
    const pdf = simpleReportPdf([
      `Brand: ${brand.name}`,
      `View: ${view}`,
      `Period: ${period}`,
      `Source: ${source}`,
      `Outcome: ${outcome}`,
      "Decision rule: recommendations must include evidence, confidence, and next action.",
      "Add imported reports, connected channels, lead capture, and revenue data to enrich this PDF.",
    ]);
    return new Response(pdf, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="prifyn-${view.toLowerCase()}-report.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ ok: false, error: "Report PDF could not be generated." }, { status: 503 });
  }
}
