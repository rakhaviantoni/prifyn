CREATE TYPE "public"."connection_capability_status" AS ENUM('available', 'granted', 'missing', 'restricted');--> statement-breakpoint
CREATE TYPE "public"."integration_sync_status" AS ENUM('idle', 'queued', 'running', 'completed', 'delayed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."provider_account_status" AS ENUM('available', 'connected', 'restricted', 'inactive', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."provider_authorization_status" AS ENUM('pending', 'connected', 'needs_attention', 'revoked', 'error');--> statement-breakpoint
CREATE TYPE "public"."publishing_job_status" AS ENUM('queued', 'validating', 'submitting', 'in_review', 'succeeded', 'partially_succeeded', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "brand_account_bindings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"provider_account_id" uuid NOT NULL,
	"usage_role" text DEFAULT 'primary' NOT NULL,
	"reporting_enabled" boolean DEFAULT true NOT NULL,
	"publishing_enabled" boolean DEFAULT false NOT NULL,
	"selected_identity_external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "channel_publishing_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"platform_campaign_ref_id" uuid,
	"provider_account_id" uuid,
	"platform" text NOT NULL,
	"operation" text DEFAULT 'publish' NOT NULL,
	"status" "publishing_job_status" DEFAULT 'queued' NOT NULL,
	"external_job_id" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"request_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_error_code" text,
	"last_error_message" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connection_capabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_account_id" uuid NOT NULL,
	"capability" text NOT NULL,
	"status" "connection_capability_status" DEFAULT 'available' NOT NULL,
	"reason" text,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connection_sync_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_account_id" uuid NOT NULL,
	"resource_type" text NOT NULL,
	"status" "integration_sync_status" DEFAULT 'idle' NOT NULL,
	"cursor" text,
	"last_started_at" timestamp with time zone,
	"last_completed_at" timestamp with time zone,
	"next_sync_at" timestamp with time zone,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"last_error_code" text,
	"last_error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"organization_id" uuid,
	"provider_account_id" uuid,
	"actor_user_id" text,
	"action" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_oauth_states" (
	"state_hash" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"return_to" text DEFAULT '/app/settings/connections' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"authorization_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"external_account_id" text NOT NULL,
	"manager_account_id" text,
	"display_name" text,
	"account_type" text DEFAULT 'advertiser' NOT NULL,
	"currency" text,
	"timezone" text,
	"status" "provider_account_status" DEFAULT 'available' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_discovered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_authorizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"provider" text NOT NULL,
	"connected_by_user_id" text NOT NULL,
	"status" "provider_authorization_status" DEFAULT 'pending' NOT NULL,
	"encrypted_credential_payload" text,
	"granted_scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"token_expires_at" timestamp with time zone,
	"last_refreshed_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"last_error_code" text,
	"last_error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "brand_account_bindings" ADD CONSTRAINT "brand_account_bindings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_account_bindings" ADD CONSTRAINT "brand_account_bindings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_account_bindings" ADD CONSTRAINT "brand_account_bindings_provider_account_id_provider_accounts_id_fk" FOREIGN KEY ("provider_account_id") REFERENCES "public"."provider_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_publishing_jobs" ADD CONSTRAINT "channel_publishing_jobs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_publishing_jobs" ADD CONSTRAINT "channel_publishing_jobs_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_publishing_jobs" ADD CONSTRAINT "channel_publishing_jobs_platform_campaign_ref_id_platform_campaign_refs_id_fk" FOREIGN KEY ("platform_campaign_ref_id") REFERENCES "public"."platform_campaign_refs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_publishing_jobs" ADD CONSTRAINT "channel_publishing_jobs_provider_account_id_provider_accounts_id_fk" FOREIGN KEY ("provider_account_id") REFERENCES "public"."provider_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection_capabilities" ADD CONSTRAINT "connection_capabilities_provider_account_id_provider_accounts_id_fk" FOREIGN KEY ("provider_account_id") REFERENCES "public"."provider_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection_sync_states" ADD CONSTRAINT "connection_sync_states_provider_account_id_provider_accounts_id_fk" FOREIGN KEY ("provider_account_id") REFERENCES "public"."provider_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_audit_events" ADD CONSTRAINT "integration_audit_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_audit_events" ADD CONSTRAINT "integration_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_audit_events" ADD CONSTRAINT "integration_audit_events_provider_account_id_provider_accounts_id_fk" FOREIGN KEY ("provider_account_id") REFERENCES "public"."provider_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_audit_events" ADD CONSTRAINT "integration_audit_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_oauth_states" ADD CONSTRAINT "integration_oauth_states_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_oauth_states" ADD CONSTRAINT "integration_oauth_states_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_oauth_states" ADD CONSTRAINT "integration_oauth_states_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_accounts" ADD CONSTRAINT "provider_accounts_authorization_id_provider_authorizations_id_fk" FOREIGN KEY ("authorization_id") REFERENCES "public"."provider_authorizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_authorizations" ADD CONSTRAINT "provider_authorizations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_authorizations" ADD CONSTRAINT "provider_authorizations_connected_by_user_id_users_id_fk" FOREIGN KEY ("connected_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "brand_account_bindings_org_account_uidx" ON "brand_account_bindings" USING btree ("organization_id","provider_account_id");--> statement-breakpoint
CREATE INDEX "brand_account_bindings_workspace_org_idx" ON "brand_account_bindings" USING btree ("workspace_id","organization_id");--> statement-breakpoint
CREATE INDEX "channel_publishing_jobs_campaign_status_idx" ON "channel_publishing_jobs" USING btree ("campaign_id","status");--> statement-breakpoint
CREATE INDEX "channel_publishing_jobs_workspace_created_idx" ON "channel_publishing_jobs" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "connection_capabilities_account_capability_uidx" ON "connection_capabilities" USING btree ("provider_account_id","capability");--> statement-breakpoint
CREATE UNIQUE INDEX "connection_sync_states_account_resource_uidx" ON "connection_sync_states" USING btree ("provider_account_id","resource_type");--> statement-breakpoint
CREATE INDEX "connection_sync_states_status_next_idx" ON "connection_sync_states" USING btree ("status","next_sync_at");--> statement-breakpoint
CREATE INDEX "integration_audit_events_workspace_created_idx" ON "integration_audit_events" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "integration_audit_events_account_idx" ON "integration_audit_events" USING btree ("provider_account_id");--> statement-breakpoint
CREATE INDEX "integration_oauth_states_expiry_idx" ON "integration_oauth_states" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_accounts_authorization_external_uidx" ON "provider_accounts" USING btree ("authorization_id","external_account_id");--> statement-breakpoint
CREATE INDEX "provider_accounts_provider_external_idx" ON "provider_accounts" USING btree ("provider","external_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_authorizations_workspace_provider_user_uidx" ON "provider_authorizations" USING btree ("workspace_id","provider","connected_by_user_id");--> statement-breakpoint
CREATE INDEX "provider_authorizations_workspace_status_idx" ON "provider_authorizations" USING btree ("workspace_id","status");