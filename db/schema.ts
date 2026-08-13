import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const workspaceStatus = pgEnum("workspace_status", ["active", "suspended", "archived"]);
export const userAccountType = pgEnum("user_account_type", ["brand", "agency", "creator"]);
export const campaignStatus = pgEnum("campaign_status", ["draft", "ready", "active", "paused", "completed", "archived"]);
export const participantStatus = pgEnum("participant_status", ["invited", "applied", "approved", "active", "completed", "declined", "withdrawn"]);
export const deliverableStatus = pgEnum("deliverable_status", ["planned", "awaiting_submission", "in_review", "revision_requested", "approved", "rejected"]);
export const importStatus = pgEnum("import_status", ["uploaded", "validating", "needs_mapping", "processing", "completed", "failed"]);
export const insightStatus = pgEnum("insight_status", ["draft", "published", "accepted", "edited", "dismissed", "expired"]);
export const campaignKind = pgEnum("campaign_kind", ["ads", "kol", "hybrid"]);
export const platformConnectionStatus = pgEnum("platform_connection_status", ["disconnected", "pending", "connected", "error"]);
export const platformCampaignStatus = pgEnum("platform_campaign_status", ["draft", "syncing", "ready", "running", "paused", "rejected", "completed", "error"]);
export const providerAuthorizationStatus = pgEnum("provider_authorization_status", ["pending", "connected", "needs_attention", "revoked", "error"]);
export const providerAccountStatus = pgEnum("provider_account_status", ["available", "connected", "restricted", "inactive", "revoked"]);
export const connectionCapabilityStatus = pgEnum("connection_capability_status", ["available", "granted", "missing", "restricted"]);
export const integrationSyncStatus = pgEnum("integration_sync_status", ["idle", "queued", "running", "completed", "delayed", "failed"]);
export const publishingJobStatus = pgEnum("publishing_job_status", ["queued", "validating", "submitting", "in_review", "succeeded", "partially_succeeded", "failed", "cancelled"]);
export const reportBreakdown = pgEnum("report_breakdown", ["performance", "audience", "location", "creative", "user_journey"]);
export const billingInterval = pgEnum("billing_interval", ["monthly", "annual"]);
export const subscriptionStatus = pgEnum("subscription_status", ["trialing", "active", "past_due", "cancelled", "paused"]);
export const invoiceStatus = pgEnum("invoice_status", ["draft", "open", "paid", "void", "uncollectible"]);

// Better Auth core. IDs remain text because Better Auth generates them.
export const user = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt,
  updatedAt,
});

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  accountType: userAccountType("account_type").notNull(),
  displayName: text("display_name"),
  onboardingStatus: text("onboarding_status").default("started").notNull(),
  createdAt,
  updatedAt,
}, (table) => [index("user_profiles_account_type_idx").on(table.accountType)]);

export const session = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt,
  updatedAt,
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => [index("sessions_user_idx").on(table.userId)]);

export const account = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("accounts_provider_account_uidx").on(table.providerId, table.accountId), index("accounts_user_idx").on(table.userId)]);

export const verification = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt,
  updatedAt,
}, (table) => [index("verifications_identifier_idx").on(table.identifier)]);

// Better Auth organization plugin represents the top-level PRIFYN workspace.
export const organization = pgTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  createdAt,
  metadata: text("metadata"),
  status: workspaceStatus("status").default("active").notNull(),
  defaultCurrency: text("default_currency").default("IDR").notNull(),
  timezone: text("timezone").default("Asia/Jakarta").notNull(),
});

export const workspaceSubscriptions = pgTable("workspace_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  planCode: text("plan_code").notNull(),
  status: subscriptionStatus("status").default("trialing").notNull(),
  interval: billingInterval("interval").default("monthly").notNull(),
  includedBrands: integer("included_brands").notNull(),
  includedMembers: integer("included_members"),
  includedAiActions: integer("included_ai_actions").default(0).notNull(),
  additionalBrandSlots: integer("additional_brand_slots").default(0).notNull(),
  providerCustomerId: text("provider_customer_id"),
  providerSubscriptionId: text("provider_subscription_id"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("workspace_subscriptions_workspace_uidx").on(table.workspaceId), uniqueIndex("workspace_subscriptions_provider_uidx").on(table.providerSubscriptionId)]);

export const billingUsage = pgTable("billing_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  metric: text("metric").notNull(),
  quantity: integer("quantity").default(0).notNull(),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  providerMeterEventId: text("provider_meter_event_id"),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("billing_usage_workspace_metric_period_uidx").on(table.workspaceId, table.metric, table.periodStart), index("billing_usage_workspace_period_idx").on(table.workspaceId, table.periodEnd)]);

export const billingInvoices = pgTable("billing_invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  status: invoiceStatus("status").default("draft").notNull(),
  currency: text("currency").default("IDR").notNull(),
  subtotalMinor: integer("subtotal_minor").notNull(),
  taxMinor: integer("tax_minor").default(0).notNull(),
  totalMinor: integer("total_minor").notNull(),
  lineItems: jsonb("line_items").$type<Array<{ label: string; amountMinor: number; quantity?: number }>>().default([]).notNull(),
  providerInvoiceId: text("provider_invoice_id"),
  hostedInvoiceUrl: text("hosted_invoice_url"),
  invoicePdfUrl: text("invoice_pdf_url"),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("billing_invoices_workspace_number_uidx").on(table.workspaceId, table.invoiceNumber), uniqueIndex("billing_invoices_provider_uidx").on(table.providerInvoiceId), index("billing_invoices_workspace_status_idx").on(table.workspaceId, table.status)]);

export const member = pgTable("workspace_members", {
  id: text("id").primaryKey(),
  organizationId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  createdAt,
}, (table) => [uniqueIndex("workspace_members_workspace_user_uidx").on(table.organizationId, table.userId), index("workspace_members_user_idx").on(table.userId)]);

export const invitation = pgTable("workspace_invitations", {
  id: text("id").primaryKey(),
  organizationId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt,
  inviterId: text("inviter_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => [index("workspace_invitations_email_idx").on(table.email), index("workspace_invitations_workspace_idx").on(table.organizationId)]);

// Operating brands or business units nested inside a workspace.
export const businessOrganizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  type: text("type").default("brand").notNull(),
  logoUrl: text("logo_url"),
  status: text("status").default("active").notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("organizations_workspace_slug_uidx").on(table.workspaceId, table.slug)]);

export const organizationMembers = pgTable("organization_members", {
  organizationId: uuid("organization_id").notNull().references(() => businessOrganizations.id, { onDelete: "cascade" }),
  workspaceMemberId: text("workspace_member_id").notNull().references(() => member.id, { onDelete: "cascade" }),
  role: text("role").default("viewer").notNull(),
  createdAt,
}, (table) => [primaryKey({ columns: [table.organizationId, table.workspaceMemberId] })]);

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => businessOrganizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  website: text("website"),
  industry: text("industry"),
  lifecycleStage: text("lifecycle_stage").default("lead").notNull(),
  ownerUserId: text("owner_user_id").references(() => user.id, { onDelete: "set null" }),
  createdAt,
  updatedAt,
  archivedAt: timestamp("archived_at", { withTimezone: true }),
}, (table) => [index("companies_org_idx").on(table.organizationId), index("companies_workspace_name_idx").on(table.workspaceId, table.name)]);

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  title: text("title"),
  source: text("source"),
  consentMetadata: jsonb("consent_metadata").$type<Record<string, unknown>>(),
  ownerUserId: text("owner_user_id").references(() => user.id, { onDelete: "set null" }),
  createdAt,
  updatedAt,
}, (table) => [index("contacts_workspace_idx").on(table.workspaceId), index("contacts_company_idx").on(table.companyId)]);

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => businessOrganizations.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "set null" }),
  contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  source: text("source"),
  status: text("status").default("open").notNull(),
  estimatedValueMinor: integer("estimated_value_minor"),
  currency: text("currency").default("IDR").notNull(),
  ownerUserId: text("owner_user_id").references(() => user.id, { onDelete: "set null" }),
  createdAt,
  updatedAt,
}, (table) => [index("leads_organization_status_idx").on(table.organizationId, table.status)]);

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  subjectType: text("subject_type").notNull(),
  subjectId: text("subject_id").notNull(),
  type: text("type").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt,
}, (table) => [index("activities_subject_idx").on(table.workspaceId, table.subjectType, table.subjectId)]);

export const creators = pgTable("creators", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  legalName: text("legal_name"),
  location: text("location"),
  bio: text("bio"),
  status: text("status").default("active").notNull(),
  verificationStatus: text("verification_status").default("unverified").notNull(),
  kolLevel: text("kol_level"),
  rateCardMinor: integer("rate_card_minor"),
  primaryNiche: text("primary_niche"),
  source: text("source").default("manual").notNull(),
  createdAt,
  updatedAt,
  archivedAt: timestamp("archived_at", { withTimezone: true }),
}, (table) => [index("creators_workspace_status_idx").on(table.workspaceId, table.status)]);

export const creatorChannels = pgTable("creator_channels", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  handle: text("handle").notNull(),
  url: text("url"),
  followerCount: integer("follower_count"),
  averageEngagementRate: numeric("average_engagement_rate", { precision: 8, scale: 5 }),
  observedAt: timestamp("observed_at", { withTimezone: true }),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("creator_channels_platform_handle_uidx").on(table.workspaceId, table.platform, table.handle), index("creator_channels_creator_idx").on(table.creatorId)]);

export const creatorAssessments = pgTable("creator_assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  summary: text("summary").notNull(),
  evidence: jsonb("evidence").$type<Array<Record<string, unknown>>>().default([]).notNull(),
  score: numeric("score", { precision: 6, scale: 3 }),
  confidence: numeric("confidence", { precision: 5, scale: 4 }),
  model: text("model"),
  policyVersion: text("policy_version").notNull(),
  validAt: timestamp("valid_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt,
}, (table) => [index("creator_assessments_creator_kind_idx").on(table.creatorId, table.kind)]);

export const creatorVerifications = pgTable("creator_verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  method: text("method").default("manual").notNull(),
  verifierUserId: text("verifier_user_id").references(() => user.id, { onDelete: "set null" }),
  evidence: jsonb("evidence").$type<Record<string, unknown>>().default({}).notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt,
}, (table) => [index("creator_verifications_creator_idx").on(table.creatorId)]);

export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => businessOrganizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  kind: campaignKind("kind").default("kol").notNull(),
  ownerUserId: text("owner_user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  status: campaignStatus("status").default("draft").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }),
  endAt: timestamp("end_at", { withTimezone: true }),
  budgetMinor: integer("budget_minor").default(0).notNull(),
  currency: text("currency").default("IDR").notNull(),
  objectiveSummary: text("objective_summary"),
  version: integer("version").default(1).notNull(),
  createdAt,
  updatedAt,
  archivedAt: timestamp("archived_at", { withTimezone: true }),
}, (table) => [index("campaigns_organization_status_idx").on(table.organizationId, table.status), index("campaigns_workspace_dates_idx").on(table.workspaceId, table.startAt, table.endAt)]);

export const adsCampaignConfigs = pgTable("ads_campaign_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  objective: text("objective").notNull(),
  conversionType: text("conversion_type"),
  budgetType: text("budget_type").default("lifetime").notNull(),
  audience: jsonb("audience").$type<Record<string, unknown>>().default({}).notNull(),
  placements: jsonb("placements").$type<string[]>().default([]).notNull(),
  dayparting: jsonb("dayparting").$type<Record<string, unknown>>(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("ads_campaign_configs_campaign_uidx").on(table.campaignId)]);

export const adCreatives = pgTable("ad_creatives", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  profileName: text("profile_name").notNull(),
  assetType: text("asset_type").notNull(),
  assetUrl: text("asset_url").notNull(),
  copy: text("copy"),
  keywords: jsonb("keywords").$type<string[]>().default([]).notNull(),
  landingPageUrl: text("landing_page_url"),
  trackingConfig: jsonb("tracking_config").$type<Record<string, unknown>>().default({}).notNull(),
  status: text("status").default("draft").notNull(),
  createdAt,
  updatedAt,
}, (table) => [index("ad_creatives_campaign_idx").on(table.campaignId)]);

export const platformConnections = pgTable("platform_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => businessOrganizations.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  externalAccountId: text("external_account_id"),
  displayName: text("display_name"),
  status: platformConnectionStatus("status").default("disconnected").notNull(),
  encryptedCredentialRef: text("encrypted_credential_ref"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  errorCode: text("error_code"),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("platform_connections_org_platform_account_uidx").on(table.organizationId, table.platform, table.externalAccountId), index("platform_connections_workspace_status_idx").on(table.workspaceId, table.status)]);

// A provider authorization is the OAuth grant. It is deliberately separate from
// the external accounts discovered through that grant and their operating-brand bindings.
export const providerAuthorizations = pgTable("provider_authorizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  connectedByUserId: text("connected_by_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  status: providerAuthorizationStatus("status").default("pending").notNull(),
  encryptedCredentialPayload: text("encrypted_credential_payload"),
  grantedScopes: jsonb("granted_scopes").$type<string[]>().default([]).notNull(),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  lastRefreshedAt: timestamp("last_refreshed_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  lastErrorCode: text("last_error_code"),
  lastErrorMessage: text("last_error_message"),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("provider_authorizations_workspace_provider_user_uidx").on(table.workspaceId, table.provider, table.connectedByUserId), index("provider_authorizations_workspace_status_idx").on(table.workspaceId, table.status)]);

export const providerAccounts = pgTable("provider_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorizationId: uuid("authorization_id").notNull().references(() => providerAuthorizations.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  externalAccountId: text("external_account_id").notNull(),
  managerAccountId: text("manager_account_id"),
  displayName: text("display_name"),
  accountType: text("account_type").default("advertiser").notNull(),
  currency: text("currency"),
  timezone: text("timezone"),
  status: providerAccountStatus("status").default("available").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  lastDiscoveredAt: timestamp("last_discovered_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("provider_accounts_authorization_external_uidx").on(table.authorizationId, table.externalAccountId), index("provider_accounts_provider_external_idx").on(table.provider, table.externalAccountId)]);

export const brandAccountBindings = pgTable("brand_account_bindings", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => businessOrganizations.id, { onDelete: "cascade" }),
  providerAccountId: uuid("provider_account_id").notNull().references(() => providerAccounts.id, { onDelete: "cascade" }),
  usageRole: text("usage_role").default("primary").notNull(),
  reportingEnabled: boolean("reporting_enabled").default(true).notNull(),
  publishingEnabled: boolean("publishing_enabled").default(false).notNull(),
  selectedIdentityExternalId: text("selected_identity_external_id"),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("brand_account_bindings_org_account_uidx").on(table.organizationId, table.providerAccountId), index("brand_account_bindings_workspace_org_idx").on(table.workspaceId, table.organizationId)]);

export const connectionCapabilities = pgTable("connection_capabilities", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerAccountId: uuid("provider_account_id").notNull().references(() => providerAccounts.id, { onDelete: "cascade" }),
  capability: text("capability").notNull(),
  status: connectionCapabilityStatus("status").default("available").notNull(),
  reason: text("reason"),
  checkedAt: timestamp("checked_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("connection_capabilities_account_capability_uidx").on(table.providerAccountId, table.capability)]);

export const connectionSyncStates = pgTable("connection_sync_states", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerAccountId: uuid("provider_account_id").notNull().references(() => providerAccounts.id, { onDelete: "cascade" }),
  resourceType: text("resource_type").notNull(),
  status: integrationSyncStatus("status").default("idle").notNull(),
  cursor: text("cursor"),
  lastStartedAt: timestamp("last_started_at", { withTimezone: true }),
  lastCompletedAt: timestamp("last_completed_at", { withTimezone: true }),
  nextSyncAt: timestamp("next_sync_at", { withTimezone: true }),
  consecutiveFailures: integer("consecutive_failures").default(0).notNull(),
  lastErrorCode: text("last_error_code"),
  lastErrorMessage: text("last_error_message"),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("connection_sync_states_account_resource_uidx").on(table.providerAccountId, table.resourceType), index("connection_sync_states_status_next_idx").on(table.status, table.nextSyncAt)]);

export const integrationOauthStates = pgTable("integration_oauth_states", {
  stateHash: text("state_hash").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => businessOrganizations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  returnTo: text("return_to").default("/app/settings/connections").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt,
}, (table) => [index("integration_oauth_states_expiry_idx").on(table.expiresAt)]);

export const integrationAuditEvents = pgTable("integration_audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => businessOrganizations.id, { onDelete: "set null" }),
  providerAccountId: uuid("provider_account_id").references(() => providerAccounts.id, { onDelete: "set null" }),
  actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt,
}, (table) => [index("integration_audit_events_workspace_created_idx").on(table.workspaceId, table.createdAt), index("integration_audit_events_account_idx").on(table.providerAccountId)]);

export const platformCampaignRefs = pgTable("platform_campaign_refs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  connectionId: uuid("connection_id").references(() => platformConnections.id, { onDelete: "set null" }),
  platform: text("platform").notNull(),
  externalCampaignId: text("external_campaign_id"),
  externalAdGroupIds: jsonb("external_ad_group_ids").$type<string[]>().default([]).notNull(),
  externalAdIds: jsonb("external_ad_ids").$type<string[]>().default([]).notNull(),
  status: platformCampaignStatus("status").default("draft").notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  syncError: text("sync_error"),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("platform_campaign_refs_campaign_platform_uidx").on(table.campaignId, table.platform), index("platform_campaign_refs_status_idx").on(table.workspaceId, table.status)]);

export const channelPublishingJobs = pgTable("channel_publishing_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  platformCampaignRefId: uuid("platform_campaign_ref_id").references(() => platformCampaignRefs.id, { onDelete: "set null" }),
  providerAccountId: uuid("provider_account_id").references(() => providerAccounts.id, { onDelete: "set null" }),
  platform: text("platform").notNull(),
  operation: text("operation").default("publish").notNull(),
  status: publishingJobStatus("status").default("queued").notNull(),
  externalJobId: text("external_job_id"),
  attempts: integer("attempts").default(0).notNull(),
  requestSummary: jsonb("request_summary").$type<Record<string, unknown>>().default({}).notNull(),
  lastErrorCode: text("last_error_code"),
  lastErrorMessage: text("last_error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt,
  updatedAt,
}, (table) => [index("channel_publishing_jobs_campaign_status_idx").on(table.campaignId, table.status), index("channel_publishing_jobs_workspace_created_idx").on(table.workspaceId, table.createdAt)]);

export const adsReportSnapshots = pgTable("ads_report_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  breakdown: reportBreakdown("breakdown").notNull(),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  dimensions: jsonb("dimensions").$type<Record<string, unknown>>().default({}).notNull(),
  metrics: jsonb("metrics").$type<Record<string, number>>().default({}).notNull(),
  sourceFreshnessAt: timestamp("source_freshness_at", { withTimezone: true }).notNull(),
  createdAt,
}, (table) => [index("ads_report_snapshots_campaign_period_idx").on(table.campaignId, table.periodStart), index("ads_report_snapshots_breakdown_idx").on(table.workspaceId, table.breakdown)]);

export const kolCampaignConfigs = pgTable("kol_campaign_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  objective: text("objective").notNull(),
  kolLevels: jsonb("kol_levels").$type<string[]>().default([]).notNull(),
  detailBrief: text("detail_brief").notNull(),
  briefAssetUrl: text("brief_asset_url"),
  platforms: jsonb("platforms").$type<string[]>().default([]).notNull(),
  kpis: jsonb("kpis").$type<Array<{ metric: string; target: number; unit: string }>>().default([]).notNull(),
  maxRevisionRounds: integer("max_revision_rounds").default(3).notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("kol_campaign_configs_campaign_uidx").on(table.campaignId)]);

export const campaignBriefs = pgTable("campaign_briefs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull(),
  status: text("status").default("draft").notNull(),
  approvedBy: text("approved_by").references(() => user.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt,
}, (table) => [uniqueIndex("campaign_briefs_campaign_version_uidx").on(table.campaignId, table.version)]);

export const campaignObjectives = pgTable("campaign_objectives", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  objectiveType: text("objective_type").notNull(),
  metricKey: text("metric_key").notNull(),
  targetValue: numeric("target_value", { precision: 20, scale: 6 }).notNull(),
  unit: text("unit").notNull(),
  priority: integer("priority").default(1).notNull(),
  createdAt,
}, (table) => [index("campaign_objectives_campaign_idx").on(table.campaignId)]);

export const leadCaptureEvents = pgTable("lead_capture_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => businessOrganizations.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  sourceChannel: text("source_channel").notNull(),
  sourceType: text("source_type").notNull(),
  sourceName: text("source_name"),
  adCreativeId: uuid("ad_creative_id").references(() => adCreatives.id, { onDelete: "set null" }),
  creatorId: uuid("creator_id").references(() => creators.id, { onDelete: "set null" }),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  leadStatus: text("lead_status").default("new").notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true }).defaultNow().notNull(),
  rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>().default({}).notNull(),
  importJobId: uuid("import_job_id").references(() => importJobs.id, { onDelete: "set null" }),
  createdAt,
}, (table) => [index("lead_capture_events_campaign_idx").on(table.campaignId, table.capturedAt), index("lead_capture_events_org_status_idx").on(table.organizationId, table.leadStatus), index("lead_capture_events_creator_idx").on(table.creatorId)]);

export const campaignParticipants = pgTable("campaign_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "restrict" }),
  status: participantStatus("status").default("invited").notNull(),
  commercialTerms: jsonb("commercial_terms").$type<Record<string, unknown>>().default({}).notNull(),
  invitedAt: timestamp("invited_at", { withTimezone: true }),
  appliedAt: timestamp("applied_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("campaign_participants_campaign_creator_uidx").on(table.campaignId, table.creatorId), index("campaign_participants_creator_idx").on(table.creatorId)]);

export const creatorInterviewSummaries = pgTable("creator_interview_summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  participantId: uuid("participant_id").references(() => campaignParticipants.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  matchScore: numeric("match_score", { precision: 6, scale: 3 }),
  confidence: numeric("confidence", { precision: 5, scale: 4 }),
  whyMatch: jsonb("why_match").$type<string[]>().default([]).notNull(),
  risks: jsonb("risks").$type<string[]>().default([]).notNull(),
  recommendation: text("recommendation").notNull(),
  evidence: jsonb("evidence").$type<Array<Record<string, unknown>>>().default([]).notNull(),
  model: text("model"),
  policyVersion: text("policy_version").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt,
}, (table) => [uniqueIndex("creator_interview_summaries_campaign_creator_uidx").on(table.campaignId, table.creatorId), index("creator_interview_summaries_workspace_generated_idx").on(table.workspaceId, table.generatedAt)]);

export const deliverables = pgTable("deliverables", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  participantId: uuid("participant_id").notNull().references(() => campaignParticipants.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  contentType: text("content_type").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  publishScheduledAt: timestamp("publish_scheduled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  publishedUrl: text("published_url"),
  requirements: jsonb("requirements").$type<Record<string, unknown>>().default({}).notNull(),
  status: deliverableStatus("status").default("planned").notNull(),
  version: integer("version").default(1).notNull(),
  createdAt,
  updatedAt,
}, (table) => [index("deliverables_participant_status_idx").on(table.participantId, table.status), index("deliverables_due_idx").on(table.workspaceId, table.dueAt)]);

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  deliverableId: uuid("deliverable_id").notNull().references(() => deliverables.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  assetUrl: text("asset_url").notNull(),
  caption: text("caption"),
  status: text("status").default("submitted").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt,
}, (table) => [uniqueIndex("submissions_deliverable_version_uidx").on(table.deliverableId, table.version)]);

export const submissionReviews = pgTable("submission_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  submissionId: uuid("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
  decision: text("decision").notNull(),
  feedback: text("feedback"),
  reviewerUserId: text("reviewer_user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  decidedAt: timestamp("decided_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt,
}, (table) => [index("submission_reviews_submission_idx").on(table.submissionId)]);

export const kolPerformanceReports = pgTable("kol_performance_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "restrict" }),
  platform: text("platform").notNull(),
  views: integer("views").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  conversions: numeric("conversions", { precision: 18, scale: 4 }).default("0").notNull(),
  attributedRevenueMinor: integer("attributed_revenue_minor").default(0).notNull(),
  totalCostMinor: integer("total_cost_minor").default(0).notNull(),
  roas: numeric("roas", { precision: 12, scale: 4 }),
  source: text("source").default("manual").notNull(),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("kol_performance_campaign_creator_platform_uidx").on(table.campaignId, table.creatorId, table.platform), index("kol_performance_workspace_observed_idx").on(table.workspaceId, table.observedAt)]);

export const rewards = pgTable("rewards", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  participantId: uuid("participant_id").notNull().references(() => campaignParticipants.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  amountMinor: integer("amount_minor"),
  currency: text("currency").default("IDR").notNull(),
  nonCashValue: jsonb("non_cash_value").$type<Record<string, unknown>>(),
  approvalStatus: text("approval_status").default("pending").notNull(),
  createdAt,
  updatedAt,
}, (table) => [index("rewards_participant_idx").on(table.participantId)]);

export const paymentStatusRecords = pgTable("payment_status_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  rewardId: uuid("reward_id").notNull().references(() => rewards.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  externalReference: text("external_reference"),
  changedBy: text("changed_by").references(() => user.id, { onDelete: "set null" }),
  changedAt: timestamp("changed_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("payment_status_reward_idx").on(table.rewardId, table.changedAt)]);

export const trackingAssets = pgTable("tracking_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  participantId: uuid("participant_id").references(() => campaignParticipants.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  tokenHash: text("token_hash"),
  displayCode: text("display_code"),
  destinationUrl: text("destination_url"),
  validFrom: timestamp("valid_from", { withTimezone: true }),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  createdAt,
}, (table) => [uniqueIndex("tracking_assets_workspace_code_uidx").on(table.workspaceId, table.displayCode), index("tracking_assets_campaign_idx").on(table.campaignId)]);

export const campaignAttributions = pgTable("campaign_attributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => businessOrganizations.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  customerId: uuid("customer_id").references(() => companies.id, { onDelete: "set null" }),
  creatorId: uuid("creator_id").references(() => creators.id, { onDelete: "set null" }),
  adCreativeId: uuid("ad_creative_id").references(() => adCreatives.id, { onDelete: "set null" }),
  trackingAssetId: uuid("tracking_asset_id").references(() => trackingAssets.id, { onDelete: "set null" }),
  attributionLevel: text("attribution_level").default("lead").notNull(),
  sourceChannel: text("source_channel").notNull(),
  sourceDetail: text("source_detail"),
  confidence: numeric("confidence", { precision: 5, scale: 4 }),
  valueMinor: integer("value_minor").default(0).notNull(),
  currency: text("currency").default("IDR").notNull(),
  evidence: jsonb("evidence").$type<Array<Record<string, unknown>>>().default([]).notNull(),
  attributedAt: timestamp("attributed_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt,
}, (table) => [index("campaign_attributions_campaign_level_idx").on(table.campaignId, table.attributionLevel), index("campaign_attributions_lead_idx").on(table.leadId), index("campaign_attributions_creator_idx").on(table.creatorId)]);

export const metricDefinitions = pgTable("metric_definitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull(),
  version: integer("version").notNull(),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  aggregation: text("aggregation").notNull(),
  description: text("description"),
  createdAt,
}, (table) => [uniqueIndex("metric_definitions_key_version_uidx").on(table.key, table.version)]);

export const importJobs = pgTable("import_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => businessOrganizations.id, { onDelete: "cascade" }),
  sourceType: text("source_type").notNull(),
  objectKey: text("object_key").notNull(),
  checksum: text("checksum").notNull(),
  mappingVersion: integer("mapping_version").default(1).notNull(),
  status: importStatus("status").default("uploaded").notNull(),
  totalRows: integer("total_rows").default(0).notNull(),
  acceptedRows: integer("accepted_rows").default(0).notNull(),
  rejectedRows: integer("rejected_rows").default(0).notNull(),
  errorSummary: jsonb("error_summary").$type<Record<string, unknown>>(),
  createdBy: text("created_by").notNull().references(() => user.id, { onDelete: "restrict" }),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("import_jobs_org_checksum_uidx").on(table.organizationId, table.sourceType, table.checksum), index("import_jobs_workspace_status_idx").on(table.workspaceId, table.status)]);

export const importMappings = pgTable("import_mappings", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => businessOrganizations.id, { onDelete: "cascade" }),
  sourceType: text("source_type").notNull(),
  name: text("name").notNull(),
  mappingVersion: integer("mapping_version").default(1).notNull(),
  supportedExtensions: jsonb("supported_extensions").$type<string[]>().default([]).notNull(),
  requiredColumns: jsonb("required_columns").$type<string[]>().default([]).notNull(),
  columnMap: jsonb("column_map").$type<Record<string, string>>().default({}).notNull(),
  metricMap: jsonb("metric_map").$type<Record<string, string>>().default({}).notNull(),
  notes: text("notes"),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("import_mappings_org_source_version_uidx").on(table.organizationId, table.sourceType, table.mappingVersion), index("import_mappings_workspace_source_idx").on(table.workspaceId, table.sourceType)]);

export const importRows = pgTable("import_rows", {
  id: uuid("id").defaultRandom().primaryKey(),
  importJobId: uuid("import_job_id").notNull().references(() => importJobs.id, { onDelete: "cascade" }),
  rowNumber: integer("row_number").notNull(),
  subjectType: text("subject_type").notNull(),
  subjectId: text("subject_id").notNull(),
  dimensions: jsonb("dimensions").$type<Record<string, unknown>>().default({}).notNull(),
  normalizedMetrics: jsonb("normalized_metrics").$type<Record<string, number>>().default({}).notNull(),
  rowHash: text("row_hash").notNull(),
  status: text("status").default("accepted").notNull(),
  errors: jsonb("errors").$type<string[]>().default([]).notNull(),
  createdAt,
}, (table) => [uniqueIndex("import_rows_job_row_uidx").on(table.importJobId, table.rowNumber), index("import_rows_subject_idx").on(table.subjectType, table.subjectId)]);

export const performanceFacts = pgTable("performance_facts", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => businessOrganizations.id, { onDelete: "cascade" }),
  subjectType: text("subject_type").notNull(),
  subjectId: text("subject_id").notNull(),
  metricKey: text("metric_key").notNull(),
  metricVersion: integer("metric_version").notNull(),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  value: numeric("value", { precision: 24, scale: 8 }).notNull(),
  source: text("source").notNull(),
  importJobId: uuid("import_job_id").references(() => importJobs.id, { onDelete: "set null" }),
  createdAt,
}, (table) => [index("performance_facts_subject_period_idx").on(table.workspaceId, table.subjectType, table.subjectId, table.periodStart), index("performance_facts_metric_idx").on(table.organizationId, table.metricKey, table.periodStart)]);

export const conversionEvents = pgTable("conversion_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => businessOrganizations.id, { onDelete: "cascade" }),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  valueMinor: integer("value_minor"),
  currency: text("currency").default("IDR").notNull(),
  trackingAssetId: uuid("tracking_asset_id").references(() => trackingAssets.id, { onDelete: "set null" }),
  externalReference: text("external_reference"),
  evidenceSource: text("evidence_source").notNull(),
  createdAt,
}, (table) => [uniqueIndex("conversion_events_source_external_uidx").on(table.organizationId, table.evidenceSource, table.externalReference), index("conversion_events_tracking_idx").on(table.trackingAssetId, table.occurredAt)]);

export const attributionRuns = pgTable("attribution_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  model: text("model").notNull(),
  windowDays: integer("window_days").notNull(),
  inputCutoff: timestamp("input_cutoff", { withTimezone: true }).notNull(),
  status: text("status").default("pending").notNull(),
  assumptions: jsonb("assumptions").$type<Record<string, unknown>>().default({}).notNull(),
  version: integer("version").default(1).notNull(),
  createdAt,
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [index("attribution_runs_campaign_idx").on(table.campaignId, table.createdAt)]);

export const attributionResults = pgTable("attribution_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  runId: uuid("run_id").notNull().references(() => attributionRuns.id, { onDelete: "cascade" }),
  subjectType: text("subject_type").notNull(),
  subjectId: text("subject_id").notNull(),
  conversionCount: numeric("conversion_count", { precision: 18, scale: 4 }).default("0").notNull(),
  revenueMinor: integer("revenue_minor").default(0).notNull(),
  credit: numeric("credit", { precision: 12, scale: 8 }).notNull(),
  createdAt,
}, (table) => [uniqueIndex("attribution_results_run_subject_uidx").on(table.runId, table.subjectType, table.subjectId)]);

export const insightRuns = pgTable("insight_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => businessOrganizations.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  subjectType: text("subject_type").notNull(),
  subjectId: text("subject_id").notNull(),
  promptVersion: text("prompt_version").notNull(),
  policyVersion: text("policy_version").notNull(),
  provider: text("provider"),
  model: text("model"),
  inputCutoff: timestamp("input_cutoff", { withTimezone: true }).notNull(),
  status: text("status").default("pending").notNull(),
  latencyMs: integer("latency_ms"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  costUsd: numeric("cost_usd", { precision: 14, scale: 8 }),
  createdAt,
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [index("insight_runs_subject_idx").on(table.workspaceId, table.subjectType, table.subjectId, table.createdAt)]);

export const insights = pgTable("insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  runId: uuid("run_id").notNull().references(() => insightRuns.id, { onDelete: "cascade" }),
  diagnosis: text("diagnosis").notNull(),
  why: text("why").notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
  limitations: jsonb("limitations").$type<string[]>().default([]).notNull(),
  status: insightStatus("status").default("draft").notNull(),
  createdAt,
  updatedAt,
}, (table) => [index("insights_run_idx").on(table.runId)]);

export const insightEvidence = pgTable("insight_evidence", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  runId: uuid("run_id").notNull().references(() => insightRuns.id, { onDelete: "cascade" }),
  evidenceType: text("evidence_type").notNull(),
  sourceReference: text("source_reference").notNull(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  createdAt,
}, (table) => [index("insight_evidence_run_idx").on(table.runId)]);

export const recommendedActions = pgTable("recommended_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  insightId: uuid("insight_id").notNull().references(() => insights.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  expectedOutcome: text("expected_outcome").notNull(),
  priority: text("priority").default("next").notNull(),
  ownerUserId: text("owner_user_id").references(() => user.id, { onDelete: "set null" }),
  dueAt: timestamp("due_at", { withTimezone: true }),
  status: text("status").default("proposed").notNull(),
  decidedBy: text("decided_by").references(() => user.id, { onDelete: "set null" }),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  decisionReason: text("decision_reason"),
  createdAt,
  updatedAt,
}, (table) => [index("recommended_actions_insight_idx").on(table.insightId), index("recommended_actions_owner_status_idx").on(table.ownerUserId, table.status)]);

export const outboxEvents = pgTable("outbox_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").references(() => organization.id, { onDelete: "cascade" }),
  aggregateType: text("aggregate_type").notNull(),
  aggregateId: text("aggregate_id").notNull(),
  eventType: text("event_type").notNull(),
  eventVersion: integer("event_version").default(1).notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  attemptCount: integer("attempt_count").default(0).notNull(),
  lastError: text("last_error"),
}, (table) => [index("outbox_unpublished_idx").on(table.publishedAt, table.occurredAt)]);

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").references(() => organization.id, { onDelete: "set null" }),
  actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id").notNull(),
  beforeSummary: jsonb("before_summary").$type<Record<string, unknown>>(),
  afterSummary: jsonb("after_summary").$type<Record<string, unknown>>(),
  correlationId: text("correlation_id"),
  ipAddress: text("ip_address"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("audit_events_workspace_resource_idx").on(table.workspaceId, table.resourceType, table.resourceId), index("audit_events_actor_idx").on(table.actorUserId, table.occurredAt)]);

// Creator Intelligence is separated from the brand-owned creator directory. A creator
// can own one portable identity while each workspace keeps its own governed relationship.
export const creatorProfiles = pgTable("creator_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  username: text("username").notNull().unique(),
  location: text("location"),
  languages: jsonb("languages").$type<string[]>().default([]).notNull(),
  bio: text("bio"),
  categories: jsonb("categories").$type<string[]>().default([]).notNull(),
  niches: jsonb("niches").$type<string[]>().default([]).notNull(),
  collaborationPreferences: jsonb("collaboration_preferences").$type<string[]>().default([]).notNull(),
  rateCard: jsonb("rate_card").$type<Record<string, unknown>>(),
  availability: jsonb("availability").$type<Record<string, unknown>>(),
  onboardingStatus: text("onboarding_status").default("draft").notNull(),
  visibility: text("visibility").default("invite_only").notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("creator_profiles_user_uidx").on(table.userId)]);

export const creatorSocialAccounts = pgTable("creator_social_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorProfileId: uuid("creator_profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  handle: text("handle").notNull(),
  profileUrl: text("profile_url").notNull(),
  externalAccountId: text("external_account_id"),
  connectionStatus: text("connection_status").default("public_link").notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("creator_social_profile_platform_uidx").on(table.creatorProfileId, table.platform), index("creator_social_handle_idx").on(table.platform, table.handle)]);

export const creatorMetricSnapshots = pgTable("creator_metric_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  socialAccountId: uuid("social_account_id").notNull().references(() => creatorSocialAccounts.id, { onDelete: "cascade" }),
  metrics: jsonb("metrics").$type<Record<string, number>>().default({}).notNull(),
  source: text("source").notNull(),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  createdAt,
}, (table) => [index("creator_metric_account_observed_idx").on(table.socialAccountId, table.observedAt)]);

export const creatorAudienceSnapshots = pgTable("creator_audience_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  socialAccountId: uuid("social_account_id").notNull().references(() => creatorSocialAccounts.id, { onDelete: "cascade" }),
  locations: jsonb("locations").$type<Array<Record<string, unknown>>>().default([]).notNull(),
  ageBands: jsonb("age_bands").$type<Array<Record<string, unknown>>>().default([]).notNull(),
  gender: jsonb("gender").$type<Array<Record<string, unknown>>>().default([]).notNull(),
  sampleSize: integer("sample_size"),
  source: text("source").notNull(),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  createdAt,
}, (table) => [index("creator_audience_account_observed_idx").on(table.socialAccountId, table.observedAt)]);

export const creatorPortfolioItems = pgTable("creator_portfolio_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorProfileId: uuid("creator_profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  publicUrl: text("public_url"),
  storageKey: text("storage_key"),
  brandName: text("brand_name"),
  resultSnapshot: jsonb("result_snapshot").$type<Record<string, unknown>>(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt,
  updatedAt,
}, (table) => [index("creator_portfolio_profile_idx").on(table.creatorProfileId, table.createdAt)]);

export const creatorAnalysisRuns = pgTable("creator_analysis_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorProfileId: uuid("creator_profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  purpose: text("purpose").notNull(),
  provider: text("provider"),
  model: text("model"),
  policyVersion: text("policy_version").notNull(),
  evidenceCutoff: timestamp("evidence_cutoff", { withTimezone: true }).notNull(),
  status: text("status").default("pending").notNull(),
  createdAt,
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [index("creator_analysis_profile_idx").on(table.creatorProfileId, table.createdAt)]);

export const creatorScores = pgTable("creator_scores", {
  id: uuid("id").defaultRandom().primaryKey(),
  analysisRunId: uuid("analysis_run_id").notNull().references(() => creatorAnalysisRuns.id, { onDelete: "cascade" }),
  dimension: text("dimension").notNull(),
  score: numeric("score", { precision: 6, scale: 3 }).notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
  reason: text("reason").notNull(),
  improvementSuggestion: text("improvement_suggestion"),
  limitations: jsonb("limitations").$type<string[]>().default([]).notNull(),
  createdAt,
}, (table) => [uniqueIndex("creator_scores_run_dimension_uidx").on(table.analysisRunId, table.dimension)]);

export const creatorScoreEvidence = pgTable("creator_score_evidence", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorScoreId: uuid("creator_score_id").notNull().references(() => creatorScores.id, { onDelete: "cascade" }),
  sourceType: text("source_type").notNull(),
  sourceReference: text("source_reference").notNull(),
  label: text("label").notNull(),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  createdAt,
}, (table) => [index("creator_score_evidence_score_idx").on(table.creatorScoreId)]);

export const campaignCreatorCriteria = pgTable("campaign_creator_criteria", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  locations: jsonb("locations").$type<string[]>().default([]).notNull(),
  niches: jsonb("niches").$type<string[]>().default([]).notNull(),
  platforms: jsonb("platforms").$type<string[]>().default([]).notNull(),
  creatorLevels: jsonb("creator_levels").$type<string[]>().default([]).notNull(),
  contentTypes: jsonb("content_types").$type<string[]>().default([]).notNull(),
  creatorsNeeded: integer("creators_needed").default(1).notNull(),
  applicationDeadline: timestamp("application_deadline", { withTimezone: true }),
  visibility: text("visibility").default("invite_only").notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("campaign_creator_criteria_campaign_uidx").on(table.campaignId)]);

export const campaignInvitations = pgTable("campaign_creator_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  creatorProfileId: uuid("creator_profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  invitedByUserId: text("invited_by_user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  message: text("message"),
  status: text("status").default("sent").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt,
  respondedAt: timestamp("responded_at", { withTimezone: true }),
}, (table) => [uniqueIndex("campaign_creator_invitation_uidx").on(table.campaignId, table.creatorProfileId), index("campaign_invitations_workspace_status_idx").on(table.workspaceId, table.status)]);

export const creatorApplications = pgTable("creator_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  creatorProfileId: uuid("creator_profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  proposal: text("proposal").notNull(),
  proposedRateMinor: integer("proposed_rate_minor"),
  currency: text("currency").default("IDR").notNull(),
  answers: jsonb("answers").$type<Array<Record<string, unknown>>>().default([]).notNull(),
  portfolioItemIds: jsonb("portfolio_item_ids").$type<string[]>().default([]).notNull(),
  status: text("status").default("submitted").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt,
}, (table) => [uniqueIndex("creator_applications_campaign_profile_uidx").on(table.campaignId, table.creatorProfileId), index("creator_applications_workspace_status_idx").on(table.workspaceId, table.status)]);

export const applicationReviews = pgTable("creator_application_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicationId: uuid("application_id").notNull().references(() => creatorApplications.id, { onDelete: "cascade" }),
  reviewerUserId: text("reviewer_user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  decision: text("decision").notNull(),
  reason: text("reason"),
  scoreSnapshot: jsonb("score_snapshot").$type<Record<string, unknown>>(),
  createdAt,
}, (table) => [index("application_reviews_application_idx").on(table.applicationId)]);

export const collaborationConversations = pgTable("collaboration_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  creatorProfileId: uuid("creator_profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "cascade" }),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("collaboration_conversation_campaign_creator_uidx").on(table.campaignId, table.creatorProfileId)]);

export const collaborationMessages = pgTable("collaboration_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => collaborationConversations.id, { onDelete: "cascade" }),
  senderUserId: text("sender_user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  body: text("body").notNull(),
  attachmentKeys: jsonb("attachment_keys").$type<string[]>().default([]).notNull(),
  createdAt,
  readAt: timestamp("read_at", { withTimezone: true }),
}, (table) => [index("collaboration_messages_conversation_idx").on(table.conversationId, table.createdAt)]);

export const creatorPaymentMilestones = pgTable("creator_payment_milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  creatorProfileId: uuid("creator_profile_id").notNull().references(() => creatorProfiles.id, { onDelete: "restrict" }),
  label: text("label").notNull(),
  amountMinor: integer("amount_minor").notNull(),
  currency: text("currency").default("IDR").notNull(),
  triggerType: text("trigger_type").notNull(),
  status: text("status").default("pending").notNull(),
  providerReference: text("provider_reference"),
  dueAt: timestamp("due_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt,
  updatedAt,
}, (table) => [index("creator_payment_workspace_status_idx").on(table.workspaceId, table.status), index("creator_payment_creator_idx").on(table.creatorProfileId, table.createdAt)]);
