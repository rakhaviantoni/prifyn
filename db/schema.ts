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
export const campaignStatus = pgEnum("campaign_status", ["draft", "ready", "active", "paused", "completed", "archived"]);
export const participantStatus = pgEnum("participant_status", ["invited", "applied", "approved", "active", "completed", "declined", "withdrawn"]);
export const deliverableStatus = pgEnum("deliverable_status", ["planned", "awaiting_submission", "in_review", "revision_requested", "approved", "rejected"]);
export const importStatus = pgEnum("import_status", ["uploaded", "validating", "needs_mapping", "processing", "completed", "failed"]);
export const insightStatus = pgEnum("insight_status", ["draft", "published", "accepted", "edited", "dismissed", "expired"]);

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

export const deliverables = pgTable("deliverables", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  participantId: uuid("participant_id").notNull().references(() => campaignParticipants.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  contentType: text("content_type").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
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
