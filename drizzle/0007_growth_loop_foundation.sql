CREATE TABLE "lead_capture_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"campaign_id" uuid,
	"lead_id" uuid,
	"source_channel" text NOT NULL,
	"source_type" text NOT NULL,
	"source_name" text,
	"ad_creative_id" uuid,
	"creator_id" uuid,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"lead_status" text DEFAULT 'new' NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"raw_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"import_job_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_interview_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"participant_id" uuid,
	"summary" text NOT NULL,
	"match_score" numeric(6, 3),
	"confidence" numeric(5, 4),
	"why_match" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"risks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommendation" text NOT NULL,
	"evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"model" text,
	"policy_version" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_attributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	"lead_id" uuid,
	"customer_id" uuid,
	"creator_id" uuid,
	"ad_creative_id" uuid,
	"tracking_asset_id" uuid,
	"attribution_level" text DEFAULT 'lead' NOT NULL,
	"source_channel" text NOT NULL,
	"source_detail" text,
	"confidence" numeric(5, 4),
	"value_minor" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"attributed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lead_capture_events" ADD CONSTRAINT "lead_capture_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_capture_events" ADD CONSTRAINT "lead_capture_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_capture_events" ADD CONSTRAINT "lead_capture_events_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_capture_events" ADD CONSTRAINT "lead_capture_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_capture_events" ADD CONSTRAINT "lead_capture_events_ad_creative_id_ad_creatives_id_fk" FOREIGN KEY ("ad_creative_id") REFERENCES "public"."ad_creatives"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_capture_events" ADD CONSTRAINT "lead_capture_events_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_capture_events" ADD CONSTRAINT "lead_capture_events_import_job_id_import_jobs_id_fk" FOREIGN KEY ("import_job_id") REFERENCES "public"."import_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_interview_summaries" ADD CONSTRAINT "creator_interview_summaries_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_interview_summaries" ADD CONSTRAINT "creator_interview_summaries_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_interview_summaries" ADD CONSTRAINT "creator_interview_summaries_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_interview_summaries" ADD CONSTRAINT "creator_interview_summaries_participant_id_campaign_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."campaign_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_attributions" ADD CONSTRAINT "campaign_attributions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_attributions" ADD CONSTRAINT "campaign_attributions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_attributions" ADD CONSTRAINT "campaign_attributions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_attributions" ADD CONSTRAINT "campaign_attributions_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_attributions" ADD CONSTRAINT "campaign_attributions_customer_id_companies_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_attributions" ADD CONSTRAINT "campaign_attributions_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_attributions" ADD CONSTRAINT "campaign_attributions_ad_creative_id_ad_creatives_id_fk" FOREIGN KEY ("ad_creative_id") REFERENCES "public"."ad_creatives"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_attributions" ADD CONSTRAINT "campaign_attributions_tracking_asset_id_tracking_assets_id_fk" FOREIGN KEY ("tracking_asset_id") REFERENCES "public"."tracking_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lead_capture_events_campaign_idx" ON "lead_capture_events" USING btree ("campaign_id","captured_at");--> statement-breakpoint
CREATE INDEX "lead_capture_events_org_status_idx" ON "lead_capture_events" USING btree ("organization_id","lead_status");--> statement-breakpoint
CREATE INDEX "lead_capture_events_creator_idx" ON "lead_capture_events" USING btree ("creator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_interview_summaries_campaign_creator_uidx" ON "creator_interview_summaries" USING btree ("campaign_id","creator_id");--> statement-breakpoint
CREATE INDEX "creator_interview_summaries_workspace_generated_idx" ON "creator_interview_summaries" USING btree ("workspace_id","generated_at");--> statement-breakpoint
CREATE INDEX "campaign_attributions_campaign_level_idx" ON "campaign_attributions" USING btree ("campaign_id","attribution_level");--> statement-breakpoint
CREATE INDEX "campaign_attributions_lead_idx" ON "campaign_attributions" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "campaign_attributions_creator_idx" ON "campaign_attributions" USING btree ("creator_id");
