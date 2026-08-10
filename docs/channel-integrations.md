# PRIFYN channel connections

The UI preview must never be treated as a production connection. A real connection is activated only after the provider app is approved, its runtime credentials are configured, the user completes authorization, and the returned account is stored against the active PRIFYN brand.

## Shared flow

1. The workspace owner chooses a brand and provider.
2. PRIFYN creates a short-lived, signed OAuth state containing the workspace, brand, provider, return path, and nonce.
3. The provider authorizes the required scopes and returns to `/api/integrations/{provider}/callback`.
4. The server exchanges the code, encrypts refresh or long-lived credentials in a secrets service, and stores only the credential reference in `platform_connections.encrypted_credential_ref`.
5. PRIFYN lists accessible ad, advertiser, or shop accounts and the owner selects which identity belongs to the brand.
6. Webhooks and scheduled sync jobs update connection health, campaign delivery status, and report freshness.
7. Disconnect revokes the provider token where supported and deletes the stored secret reference.

## Provider requirements

- Meta: Facebook Login for Business, a verified business app, Marketing API permissions, App Review/Advanced Access, and selected Business Manager, ad account, Facebook Page, and Instagram professional account.
- Google Ads: OAuth 2.0 multi-user authorization with offline access and the `adwords` scope, plus an approved Google Ads developer token. Manager-account requests also need the correct login customer ID.
- TikTok: an approved TikTok for Business developer app. Exchange the advertiser authorization code for an access token, then list the advertiser accounts available to that token.
- Tokopedia: treat this as a partner-gated commerce connector. Do not promise self-service OAuth until PRIFYN receives approved partner documentation and production access for the target region and product.
- Shopee: an approved Open Platform partner app. The seller authorizes a shop; callbacks return a code and shop identifier; server calls are signed and tokens must be refreshed.

## Security and data model

- Never store raw provider tokens in browser storage or ordinary database columns.
- Encrypt tokens in a managed secrets/KMS service and persist only an opaque reference.
- Bind every connection to both `workspace_id` and `organization_id` (the selected operating brand).
- Record granted scopes, external account ID, token expiry, last sync, last error, and revocation state.
- Publishing is a separate permission from read-only reporting. Request the narrowest scope first.
- All provider callbacks require nonce/state verification, replay protection, audit events, and organization-role checks.

The existing `platform_connections` and `platform_campaign_refs` tables already provide the core brand/account and remote campaign mapping. Provider-specific account metadata and granted scopes can be kept in an encrypted secret payload or a future normalized connection-account table.
