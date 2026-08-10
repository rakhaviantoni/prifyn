import { publicIntegrationReadiness } from "@/lib/integrations/catalog";

export async function GET() {
  return Response.json({ providers: publicIntegrationReadiness() });
}
