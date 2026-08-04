CREATE TYPE "public"."campaign_kind" AS ENUM('ads', 'kol', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."platform_campaign_status" AS ENUM('draft', 'syncing', 'ready', 'running', 'paused', 'rejected', 'completed', 'error');--> statement-breakpoint
CREATE TYPE "public"."platform_connection_status" AS ENUM('disconnected', 'pending', 'connected', 'error');--> statement-breakpoint
CREATE TYPE "public"."report_breakdown" AS ENUM('performance', 'audience', 'location', 'creative', 'user_journey');--> statement-breakpoint
CREATE TABLE "ad_creatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"name" text NOT NULL,
	"profile_name" text NOT NULL,
	"asset_type" text NOT NULL,
	"asset_url" text NOT NULL,
	"copy" text,
	"keywords" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"landing_page_url" text,
	"tracking_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ads_campaign_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"objective" text NOT NULL,
	"conversion_type" text,
	"budget_type" text DEFAULT 'lifetime' NOT NULL,
	"audience" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"placements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dayparting" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ads_report_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"breakdown" "report_breakdown" NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"dimensions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source_freshness_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kol_campaign_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"objective" text NOT NULL,
	"kol_levels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"detail_brief" text NOT NULL,
	"brief_asset_url" text,
	"platforms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"kpis" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"max_revision_rounds" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kol_performance_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"conversions" numeric(18, 4) DEFAULT '0' NOT NULL,
	"attributed_revenue_minor" integer DEFAULT 0 NOT NULL,
	"total_cost_minor" integer DEFAULT 0 NOT NULL,
	"roas" numeric(12, 4),
	"source" text DEFAULT 'manual' NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_campaign_refs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"connection_id" uuid,
	"platform" text NOT NULL,
	"external_campaign_id" text,
	"external_ad_group_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"external_ad_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "platform_campaign_status" DEFAULT 'draft' NOT NULL,
	"last_synced_at" timestamp with time zone,
	"sync_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"external_account_id" text,
	"display_name" text,
	"status" "platform_connection_status" DEFAULT 'disconnected' NOT NULL,
	"encrypted_credential_ref" text,
	"token_expires_at" timestamp with time zone,
	"last_synced_at" timestamp with time zone,
	"error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "kind" "campaign_kind" DEFAULT 'kol' NOT NULL;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "kol_level" text;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "rate_card_minor" integer;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "primary_niche" text;--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "source" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "deliverables" ADD COLUMN "publish_scheduled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "deliverables" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "deliverables" ADD COLUMN "published_url" text;--> statement-breakpoint
ALTER TABLE "ad_creatives" ADD CONSTRAINT "ad_creatives_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_creatives" ADD CONSTRAINT "ad_creatives_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads_campaign_configs" ADD CONSTRAINT "ads_campaign_configs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads_campaign_configs" ADD CONSTRAINT "ads_campaign_configs_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads_report_snapshots" ADD CONSTRAINT "ads_report_snapshots_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads_report_snapshots" ADD CONSTRAINT "ads_report_snapshots_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kol_campaign_configs" ADD CONSTRAINT "kol_campaign_configs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kol_campaign_configs" ADD CONSTRAINT "kol_campaign_configs_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kol_performance_reports" ADD CONSTRAINT "kol_performance_reports_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kol_performance_reports" ADD CONSTRAINT "kol_performance_reports_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kol_performance_reports" ADD CONSTRAINT "kol_performance_reports_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_campaign_refs" ADD CONSTRAINT "platform_campaign_refs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_campaign_refs" ADD CONSTRAINT "platform_campaign_refs_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_campaign_refs" ADD CONSTRAINT "platform_campaign_refs_connection_id_platform_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."platform_connections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_connections" ADD CONSTRAINT "platform_connections_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_connections" ADD CONSTRAINT "platform_connections_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ad_creatives_campaign_idx" ON "ad_creatives" USING btree ("campaign_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ads_campaign_configs_campaign_uidx" ON "ads_campaign_configs" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "ads_report_snapshots_campaign_period_idx" ON "ads_report_snapshots" USING btree ("campaign_id","period_start");--> statement-breakpoint
CREATE INDEX "ads_report_snapshots_breakdown_idx" ON "ads_report_snapshots" USING btree ("workspace_id","breakdown");--> statement-breakpoint
CREATE UNIQUE INDEX "kol_campaign_configs_campaign_uidx" ON "kol_campaign_configs" USING btree ("campaign_id");--> statement-breakpoint
CREATE UNIQUE INDEX "kol_performance_campaign_creator_platform_uidx" ON "kol_performance_reports" USING btree ("campaign_id","creator_id","platform");--> statement-breakpoint
CREATE INDEX "kol_performance_workspace_observed_idx" ON "kol_performance_reports" USING btree ("workspace_id","observed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "platform_campaign_refs_campaign_platform_uidx" ON "platform_campaign_refs" USING btree ("campaign_id","platform");--> statement-breakpoint
CREATE INDEX "platform_campaign_refs_status_idx" ON "platform_campaign_refs" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "platform_connections_org_platform_account_uidx" ON "platform_connections" USING btree ("organization_id","platform","external_account_id");--> statement-breakpoint
CREATE INDEX "platform_connections_workspace_status_idx" ON "platform_connections" USING btree ("workspace_id","status");