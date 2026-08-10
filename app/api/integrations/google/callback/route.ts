import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import {
  brandAccountBindings, integrationAuditEvents, integrationOauthStates, providerAccounts, providerAuthorizations,
} from "@/db/schema";
import { exchangeGoogleAdsCode, googleAdsConfigured, listAccessibleGoogleAdsCustomers } from "@/lib/integrations/google-ads";
import { encryptIntegrationCredentials, hashIntegrationState } from "@/lib/integrations/security";

function finish(request: Request, values: Record<string, string>) {
  const url = new URL("/app/settings/connections", request.url);
  for (const [key, value] of Object.entries(values)) url.searchParams.set(key, value);
  return Response.redirect(url);
}

export async function GET(request: Request) {
  if (!googleAdsConfigured()) return finish(request, { connection_error: "google_provider_setup" });
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const providerError = url.searchParams.get("error");
  if (providerError) return finish(request, { connection_error: providerError });
  if (!state || !code) return finish(request, { connection_error: "invalid_callback" });

  const db = getDb();
  const stateHash = await hashIntegrationState(state);
  const states = await db.select().from(integrationOauthStates).where(and(
    eq(integrationOauthStates.stateHash, stateHash),
    eq(integrationOauthStates.provider, "google"),
    isNull(integrationOauthStates.usedAt),
    gt(integrationOauthStates.expiresAt, new Date()),
  )).limit(1);
  const oauthState = states[0];
  if (!oauthState) return finish(request, { connection_error: "expired_or_replayed_state" });

  await db.update(integrationOauthStates).set({ usedAt: new Date() }).where(eq(integrationOauthStates.stateHash, stateHash));
  try {
    const tokens = await exchangeGoogleAdsCode(request, code);
    const customerIds = await listAccessibleGoogleAdsCustomers(tokens.access_token!);
    const encryptedCredentialPayload = await encryptIntegrationCredentials({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenType: tokens.token_type,
      scope: tokens.scope,
      expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
    });
    const authorizationRows = await db.insert(providerAuthorizations).values({
      workspaceId: oauthState.workspaceId,
      provider: "google",
      connectedByUserId: oauthState.userId,
      status: "connected",
      encryptedCredentialPayload,
      grantedScopes: (tokens.scope ?? "").split(" ").filter(Boolean),
      tokenExpiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
      lastRefreshedAt: new Date(),
      lastErrorCode: null,
      lastErrorMessage: null,
    }).onConflictDoUpdate({
      target: [providerAuthorizations.workspaceId, providerAuthorizations.provider, providerAuthorizations.connectedByUserId],
      set: {
        status: "connected",
        encryptedCredentialPayload,
        grantedScopes: (tokens.scope ?? "").split(" ").filter(Boolean),
        tokenExpiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        lastRefreshedAt: new Date(),
        revokedAt: null,
        lastErrorCode: null,
        lastErrorMessage: null,
        updatedAt: new Date(),
      },
    }).returning({ id: providerAuthorizations.id });
    const authorizationId = authorizationRows[0].id;
    const discoveredAccounts = [];
    for (const customerId of customerIds) {
      const rows = await db.insert(providerAccounts).values({
        authorizationId,
        provider: "google",
        externalAccountId: customerId,
        displayName: `Google Ads · ${customerId}`,
        accountType: "advertiser",
        status: customerIds.length === 1 ? "connected" : "available",
        lastDiscoveredAt: new Date(),
      }).onConflictDoUpdate({
        target: [providerAccounts.authorizationId, providerAccounts.externalAccountId],
        set: { status: customerIds.length === 1 ? "connected" : "available", lastDiscoveredAt: new Date(), updatedAt: new Date() },
      }).returning({ id: providerAccounts.id });
      discoveredAccounts.push(rows[0]);
    }
    if (discoveredAccounts.length === 1) {
      await db.insert(brandAccountBindings).values({
        workspaceId: oauthState.workspaceId,
        organizationId: oauthState.organizationId,
        providerAccountId: discoveredAccounts[0].id,
        reportingEnabled: true,
        publishingEnabled: false,
      }).onConflictDoNothing();
    }
    await db.insert(integrationAuditEvents).values({
      workspaceId: oauthState.workspaceId,
      organizationId: oauthState.organizationId,
      actorUserId: oauthState.userId,
      action: "google.authorization.connected",
      metadata: { discoveredAccounts: customerIds.length, autoAssigned: customerIds.length === 1 },
    });
    return finish(request, { connection: "google", accounts: String(customerIds.length), selection_required: customerIds.length > 1 ? "true" : "false" });
  } catch (error) {
    await db.insert(integrationAuditEvents).values({
      workspaceId: oauthState.workspaceId,
      organizationId: oauthState.organizationId,
      actorUserId: oauthState.userId,
      action: "google.authorization.failed",
      metadata: { message: error instanceof Error ? error.message.slice(0, 240) : "Unknown authorization failure" },
    });
    return finish(request, { connection_error: "google_authorization_failed" });
  }
}
