import { getDb } from "@/db";
import { integrationOauthStates } from "@/db/schema";
import { requireConnectionAdmin } from "@/lib/integrations/access";
import { createGoogleAdsAuthorizationUrl, googleAdsConfigured } from "@/lib/integrations/google-ads";
import { createIntegrationState, hashIntegrationState } from "@/lib/integrations/security";

function settingsRedirect(request: Request, reason: string) {
  const url = new URL("/app/settings/connections", request.url);
  url.searchParams.set("connection_error", reason);
  return Response.redirect(url);
}

export async function GET(request: Request) {
  if (!googleAdsConfigured()) return settingsRedirect(request, "google_provider_setup");
  try {
    const requestUrl = new URL(request.url);
    const access = await requireConnectionAdmin(request, requestUrl.searchParams.get("organization_id"));
    const state = createIntegrationState();
    await getDb().insert(integrationOauthStates).values({
      stateHash: await hashIntegrationState(state),
      workspaceId: access.workspaceId,
      organizationId: access.organization.id,
      userId: access.userId,
      provider: "google",
      returnTo: "/app/settings/connections",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    return Response.redirect(createGoogleAdsAuthorizationUrl(request, state));
  } catch (error) {
    if (error instanceof Response) return error;
    return settingsRedirect(request, "authorization_start_failed");
  }
}
