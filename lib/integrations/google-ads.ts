const GOOGLE_ADS_SCOPE = "https://www.googleapis.com/auth/adwords";

export function googleAdsConfigured() {
  return Boolean(
    process.env.GOOGLE_ADS_CLIENT_ID &&
    process.env.GOOGLE_ADS_CLIENT_SECRET &&
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
    process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY,
  );
}

export function googleAdsRedirectUri(request: Request) {
  if (process.env.GOOGLE_ADS_REDIRECT_URI) return process.env.GOOGLE_ADS_REDIRECT_URI;
  const base = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  return new URL("/api/integrations/google/callback", base).toString();
}

export function createGoogleAdsAuthorizationUrl(request: Request, state: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
    redirect_uri: googleAdsRedirectUri(request),
    response_type: "code",
    scope: GOOGLE_ADS_SCOPE,
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    state,
  }).toString();
  return url;
}

export async function exchangeGoogleAdsCode(request: Request, code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      redirect_uri: googleAdsRedirectUri(request),
      grant_type: "authorization_code",
    }),
  });
  const body = await response.json() as { access_token?: string; refresh_token?: string; expires_in?: number; scope?: string; token_type?: string; error?: string; error_description?: string };
  if (!response.ok || !body.access_token) throw new Error(body.error_description || body.error || "Google token exchange failed.");
  return body;
}

export async function listAccessibleGoogleAdsCustomers(accessToken: string) {
  const version = process.env.GOOGLE_ADS_API_VERSION || "v25";
  const response = await fetch(`https://googleads.googleapis.com/${version}/customers:listAccessibleCustomers`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    },
  });
  const body = await response.json() as { resourceNames?: string[]; error?: { message?: string } };
  if (!response.ok) throw new Error(body.error?.message || "Google Ads account discovery failed.");
  return (body.resourceNames ?? []).map(resourceName => resourceName.replace(/^customers\//, ""));
}
